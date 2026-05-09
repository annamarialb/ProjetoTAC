import express from 'express';
import amqplib from 'amqplib';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';

const pool = new Pool({ connectionString: PG_CONNECTION });
let channel: amqplib.Channel | null = null;

async function conectarRabbitMQ(tentativa = 1): Promise<void> {
  try {
    console.log(`🔌 Conectando ao RabbitMQ (tentativa ${tentativa})...`);
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange('pedido-criado-exchange', 'fanout', { durable: true });
    console.log('✅ Orders conectado ao RabbitMQ!');
  } catch (error) {
    if (tentativa >= 10) {
      console.error('❌ Não foi possível conectar ao RabbitMQ');
      return;
    }
    console.log(`⏳ RabbitMQ não disponível. Aguardando 3s...`);
    await new Promise(r => setTimeout(r, 3000));
    return conectarRabbitMQ(tentativa + 1);
  }
}

async function publicarPedidoCriado(pedido: object): Promise<void> {
  if (!channel) {
    console.warn('⚠️ Canal RabbitMQ não disponível');
    return;
  }
  channel.publish(
    'pedido-criado-exchange',
    '',
    Buffer.from(JSON.stringify(pedido))
  );
  console.log('📤 PedidoCriadoEvent publicado no RabbitMQ!');
}

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'orders' });
});

// QUERY — Listar todos os pedidos (Read Model)
app.get('/api/v1/pedidos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em,
              json_agg(json_build_object(
                'produtoId', i.produto_id,
                'nomeProduto', i.nome_produto,
                'quantidade', i.quantidade,
                'precoUnitario', i.preco_unitario
              )) as itens
       FROM pedidos_read_model p
       LEFT JOIN itens_read_model i ON i.pedido_id = p.id
       GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em
       ORDER BY p.criado_em DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ detail: 'Erro ao consultar pedidos' });
  }
});

// QUERY — Buscar pedido por ID (Read Model)
app.get('/api/v1/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em,
              json_agg(json_build_object(
                'produtoId', i.produto_id,
                'nomeProduto', i.nome_produto,
                'quantidade', i.quantidade,
                'precoUnitario', i.preco_unitario
              )) as itens
       FROM pedidos_read_model p
       LEFT JOIN itens_read_model i ON i.pedido_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        type: 'https://example.com/erros/pedido-nao-encontrado',
        title: 'Pedido não encontrado',
        status: 404,
        detail: `Não existe pedido com o ID ${id}`
      });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ detail: 'Erro ao consultar pedido' });
  }
});

// COMMAND — Criar pedido (Write Side)
app.post('/api/v1/pedidos', async (req, res) => {
  const { usuarioId, produtoId, quantidade } = req.body;

  if (!usuarioId || !produtoId || !quantidade) {
    res.status(400).json({
      type: 'https://example.com/erros/dados-invalidos',
      title: 'Dados inválidos',
      status: 400,
      detail: 'Os campos usuarioId, produtoId e quantidade são obrigatórios'
    });
    return;
  }

  try {
    const catalogUrl = process.env.CATALOG_URL || 'http://localhost:3001';
    const response = await fetch(`${catalogUrl}/api/v1/produtos/${produtoId}`);

    if (!response.ok) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto não encontrado no Catálogo',
        status: 404,
        detail: `Não existe produto com o ID ${produtoId}`
      });
      return;
    }

    const produto = await response.json() as any;

    const pedido = {
      id: crypto.randomUUID(),
      usuarioId,
      status: 'confirmado',
      itens: [{
        produtoId,
        nomeProduto: produto.nome,
        quantidade,
        precoUnitario: produto.preco
      }],
      total: produto.preco * quantidade,
      criadoEm: new Date().toISOString()
    };

    // Publica evento no RabbitMQ (notificações + projeção no Read Model)
    await publicarPedidoCriado(pedido);

    res.status(201).json(pedido);

  } catch (error) {
    res.status(503).json({
      type: 'https://example.com/erros/servico-indisponivel',
      title: 'Serviço de Catálogo indisponível',
      status: 503,
      detail: 'Não foi possível consultar o Catálogo. Tente novamente.'
    });
  }
});

conectarRabbitMQ().catch(console.error);

export default app;