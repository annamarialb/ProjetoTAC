import express from 'express';
import amqplib from 'amqplib';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';

const pool = new Pool({ connectionString: PG_CONNECTION });
var channel: amqplib.Channel | null = null;

async function conectarRabbitMQ(tentativa = 1): Promise<void> {
  try {
    console.log('Conectando ao RabbitMQ (tentativa ' + tentativa + ')...');
    var connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange('pedido-criado-exchange', 'fanout', { durable: true });
    await channel.assertExchange('pedido-status-alterado-exchange', 'fanout', { durable: true });
    console.log('Orders conectado ao RabbitMQ!');
  } catch (error) {
    if (tentativa >= 10) {
      console.error('Nao foi possivel conectar ao RabbitMQ');
      return;
    }
    console.log('RabbitMQ nao disponivel. Aguardando 3s...');
    await new Promise(r => setTimeout(r, 3000));
    return conectarRabbitMQ(tentativa + 1);
  }
}

async function publicarPedidoCriado(pedido: object): Promise<void> {
  if (!channel) {
    console.warn('Canal RabbitMQ nao disponivel');
    return;
  }
  channel.publish(
    'pedido-criado-exchange',
    '',
    Buffer.from(JSON.stringify(pedido))
  );
  console.log('PedidoCriadoEvent publicado no RabbitMQ!');
}

async function publicarStatusAlterado(evento: object): Promise<void> {
  if (!channel) {
    console.warn('Canal RabbitMQ nao disponivel');
    return;
  }
  channel.publish(
    'pedido-status-alterado-exchange',
    '',
    Buffer.from(JSON.stringify(evento))
  );
  console.log('PedidoStatusAlteradoEvent publicado no RabbitMQ!');
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'orders' });
});

app.get('/api/v1/pedidos', async (req, res) => {
  try {
    var result = await pool.query(
      'SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em, json_agg(json_build_object(\'produtoId\', i.produto_id, \'nomeProduto\', i.nome_produto, \'quantidade\', i.quantidade, \'precoUnitario\', i.preco_unitario)) as itens FROM pedidos_read_model p LEFT JOIN itens_read_model i ON i.pedido_id = p.id GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em ORDER BY p.criado_em DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ detail: 'Erro ao consultar pedidos' });
  }
});

app.get('/api/v1/pedidos/:id', async (req, res) => {
  try {
    var id = req.params.id as string;
    var result = await pool.query(
      'SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em, json_agg(json_build_object(\'produtoId\', i.produto_id, \'nomeProduto\', i.nome_produto, \'quantidade\', i.quantidade, \'precoUnitario\', i.preco_unitario)) as itens FROM pedidos_read_model p LEFT JOIN itens_read_model i ON i.pedido_id = p.id WHERE p.id = $1 GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        type: 'https://example.com/erros/pedido-nao-encontrado',
        title: 'Pedido nao encontrado',
        status: 404,
        detail: 'Nao existe pedido com o ID ' + id
      });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ detail: 'Erro ao consultar pedido' });
  }
});

app.post('/api/v1/pedidos', async (req, res) => {
  var { usuarioId, produtoId, quantidade } = req.body;

  if (!usuarioId || !produtoId || !quantidade) {
    res.status(400).json({
      type: 'https://example.com/erros/dados-invalidos',
      title: 'Dados invalidos',
      status: 400,
      detail: 'Os campos usuarioId, produtoId e quantidade sao obrigatorios'
    });
    return;
  }

  try {
    var catalogUrl = process.env.CATALOG_URL || 'http://localhost:3001';
    var response = await fetch(catalogUrl + '/api/v1/produtos/' + produtoId);

    if (!response.ok) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto nao encontrado no Catalogo',
        status: 404,
        detail: 'Nao existe produto com o ID ' + produtoId
      });
      return;
    }

    var produto = await response.json() as any;

    var pedido = {
      id: crypto.randomUUID(),
      usuarioId: usuarioId,
      status: 'confirmado',
      itens: [{
        produtoId: produtoId,
        nomeProduto: produto.nome,
        quantidade: quantidade,
        precoUnitario: produto.preco
      }],
      total: produto.preco * quantidade,
      criadoEm: new Date().toISOString()
    };

    await publicarPedidoCriado(pedido);

    res.status(201).json(pedido);

  } catch (error) {
    res.status(503).json({
      type: 'https://example.com/erros/servico-indisponivel',
      title: 'Servico de Catalogo indisponivel',
      status: 503,
      detail: 'Nao foi possivel consultar o Catalogo. Tente novamente.'
    });
  }
});

app.put('/api/v1/pedidos/:id/status', async (req, res) => {
  var pedidoId = req.params.id as string;
  var { novoStatus, observacao } = req.body;

  if (!novoStatus) {
    res.status(400).json({
      type: 'https://example.com/erros/dados-invalidos',
      title: 'Dados invalidos',
      status: 400,
      detail: 'O campo novoStatus e obrigatorio'
    });
    return;
  }

  var statusValidos = ['confirmado', 'em_preparo', 'enviado', 'entregue', 'cancelado'];
  if (!statusValidos.includes(novoStatus)) {
    res.status(400).json({
      type: 'https://example.com/erros/status-invalido',
      title: 'Status invalido',
      status: 400,
      detail: 'Status deve ser um de: ' + statusValidos.join(', ')
    });
    return;
  }

  try {
    var result = await pool.query(
      'SELECT id, status FROM pedidos_read_model WHERE id = $1',
      [pedidoId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        type: 'https://example.com/erros/pedido-nao-encontrado',
        title: 'Pedido nao encontrado',
        status: 404,
        detail: 'Nao existe pedido com o ID ' + pedidoId
      });
      return;
    }

    var statusAnterior = result.rows[0].status;

    await publicarStatusAlterado({
      pedidoId: pedidoId,
      statusAnterior: statusAnterior,
      novoStatus: novoStatus,
      alteradoEm: new Date().toISOString(),
      observacao: observacao || null
    });

    console.log('Status do pedido ' + pedidoId + ': ' + statusAnterior + ' -> ' + novoStatus);

    res.status(200).json({
      pedidoId: pedidoId,
      statusAnterior: statusAnterior,
      novoStatus: novoStatus,
      alteradoEm: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ detail: 'Erro ao atualizar status do pedido' });
  }
});

conectarRabbitMQ().catch(console.error);

export default app;