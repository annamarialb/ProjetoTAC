import express from 'express';
import amqplib from 'amqplib';

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
let channel: amqplib.Channel | null = null;

// Conecta ao RabbitMQ com retry
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

// Publica evento no RabbitMQ
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

// Rota para listar pedidos
app.get('/api/v1/pedidos', (req, res) => {
  res.status(200).json([]);
});

// Rota para criar pedido
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
      itens: [
        {
          produtoId,
          nomeProduto: produto.nome,
          quantidade,
          precoUnitario: produto.preco
        }
      ],
      total: produto.preco * quantidade,
      criadoEm: new Date().toISOString()
    };

    // Publica evento no RabbitMQ
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

// Inicia conexão com RabbitMQ
conectarRabbitMQ().catch(console.error);

export default app;