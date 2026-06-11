import express from 'express';
import amqplib from 'amqplib';
import { Pool } from 'pg';
import logger from './infrastructure/logging/logger';
import healthRouter from './infrastructure/health/healthChecks';
import { metricsRouter, metricsMiddleware, pedidosCriados, statusAlterados, latenciaCriacao } from './infrastructure/metrics/metrics';
import { resilientFetch } from './infrastructure/resilience/resilientFetch';
import versionRouter from './infrastructure/version';

var app = express();
app.use(express.json());
app.use(metricsMiddleware);

var RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
var PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';

var pool = new Pool({ connectionString: PG_CONNECTION });
var channel: amqplib.Channel | null = null;

async function conectarRabbitMQ(tentativa = 1): Promise<void> {
  try {
    logger.info('Conectando ao RabbitMQ', { event: 'RabbitMQConnect', tentativa: tentativa });
    var connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange('pedido-criado-exchange', 'fanout', { durable: true });
    await channel.assertExchange('pedido-status-alterado-exchange', 'fanout', { durable: true });
    logger.info('Conectado ao RabbitMQ com sucesso', { event: 'RabbitMQConnected' });
  } catch (error) {
    if (tentativa >= 10) {
      logger.error('Falha ao conectar ao RabbitMQ apos 10 tentativas', { event: 'RabbitMQFailed' });
      return;
    }
    logger.warn('RabbitMQ indisponivel, aguardando 3s', { event: 'RabbitMQRetry', tentativa: tentativa });
    await new Promise(r => setTimeout(r, 3000));
    return conectarRabbitMQ(tentativa + 1);
  }
}

async function publicarPedidoCriado(pedido: any): Promise<void> {
  if (!channel) {
    logger.warn('Canal RabbitMQ indisponivel', { event: 'RabbitMQChannelNull' });
    return;
  }
  channel.publish('pedido-criado-exchange', '', Buffer.from(JSON.stringify(pedido)));
  logger.info('PedidoCriadoEvent publicado', { event: 'PedidoCriadoEvent', pedidoId: pedido.id });
}

async function publicarStatusAlterado(evento: any): Promise<void> {
  if (!channel) {
    logger.warn('Canal RabbitMQ indisponivel', { event: 'RabbitMQChannelNull' });
    return;
  }
  channel.publish('pedido-status-alterado-exchange', '', Buffer.from(JSON.stringify(evento)));
  logger.info('PedidoStatusAlteradoEvent publicado', { event: 'StatusAlteradoEvent', pedidoId: evento.pedidoId });
}

// Rotas de saude e metricas
app.use(healthRouter);
app.use(versionRouter);
app.use(metricsRouter);

// QUERY - Listar pedidos
app.get('/api/v1/pedidos', async (req, res) => {
  try {
    var result = await pool.query(
      'SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em, json_agg(json_build_object(\'produtoId\', i.produto_id, \'nomeProduto\', i.nome_produto, \'quantidade\', i.quantidade, \'precoUnitario\', i.preco_unitario)) as itens FROM pedidos_read_model p LEFT JOIN itens_read_model i ON i.pedido_id = p.id GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em ORDER BY p.criado_em DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    logger.error('Erro ao consultar pedidos', { event: 'QueryError', error: String(error) });
    res.status(500).json({ detail: 'Erro ao consultar pedidos' });
  }
});

// QUERY - Buscar pedido por ID
app.get('/api/v1/pedidos/:id', async (req, res) => {
  try {
    var id = req.params.id as string;
    var result = await pool.query(
      'SELECT p.id, p.usuario_id, p.status, p.total, p.criado_em, json_agg(json_build_object(\'produtoId\', i.produto_id, \'nomeProduto\', i.nome_produto, \'quantidade\', i.quantidade, \'precoUnitario\', i.preco_unitario)) as itens FROM pedidos_read_model p LEFT JOIN itens_read_model i ON i.pedido_id = p.id WHERE p.id = $1 GROUP BY p.id, p.usuario_id, p.status, p.total, p.criado_em',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ type: 'https://example.com/erros/pedido-nao-encontrado', title: 'Pedido nao encontrado', status: 404, detail: 'Nao existe pedido com o ID ' + id });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Erro ao consultar pedido', { event: 'QueryError', error: String(error) });
    res.status(500).json({ detail: 'Erro ao consultar pedido' });
  }
});

// COMMAND - Criar pedido com metricas e resilientFetch
app.post('/api/v1/pedidos', async (req, res) => {
  var startTime = Date.now();
  var { usuarioId, produtoId, quantidade } = req.body;

  if (!usuarioId || !produtoId || !quantidade) {
    res.status(400).json({ type: 'https://example.com/erros/dados-invalidos', title: 'Dados invalidos', status: 400, detail: 'Os campos usuarioId, produtoId e quantidade sao obrigatorios' });
    return;
  }

  try {
    var catalogUrl = process.env.CATALOG_URL || 'http://localhost:3001';

    // Usa resilientFetch com Retry + Circuit Breaker
    var response = await resilientFetch(catalogUrl + '/api/v1/produtos/' + produtoId);

    if (!response.ok) {
      res.status(404).json({ type: 'https://example.com/erros/produto-nao-encontrado', title: 'Produto nao encontrado no Catalogo', status: 404, detail: 'Nao existe produto com o ID ' + produtoId });
      return;
    }

    var produto = await response.json() as any;

    var pedido = {
      id: crypto.randomUUID(),
      usuarioId: usuarioId,
      status: 'confirmado',
      itens: [{ produtoId: produtoId, nomeProduto: produto.nome, quantidade: quantidade, precoUnitario: produto.preco }],
      total: produto.preco * quantidade,
      criadoEm: new Date().toISOString()
    };

    await publicarPedidoCriado(pedido);

    // Metricas
    pedidosCriados.inc({ status: 'confirmado' });
    var duration = (Date.now() - startTime) / 1000;
    latenciaCriacao.observe(duration);

    logger.info('Pedido criado com sucesso', { event: 'PedidoCriado', pedidoId: pedido.id, usuarioId: usuarioId, total: pedido.total, duracao: duration + 's' });

    res.status(201).json(pedido);

  } catch (error: any) {
    logger.error('Erro ao criar pedido', { event: 'PedidoErro', error: error.message });
    res.status(503).json({ type: 'https://example.com/erros/servico-indisponivel', title: 'Servico de Catalogo indisponivel', status: 503, detail: 'Nao foi possivel consultar o Catalogo. Tente novamente.' });
  }
});

// COMMAND - Atualizar status do pedido
app.put('/api/v1/pedidos/:id/status', async (req, res) => {
  var pedidoId = req.params.id as string;
  var { novoStatus, observacao } = req.body;

  if (!novoStatus) {
    res.status(400).json({ type: 'https://example.com/erros/dados-invalidos', title: 'Dados invalidos', status: 400, detail: 'O campo novoStatus e obrigatorio' });
    return;
  }

  var statusValidos = ['confirmado', 'em_preparo', 'enviado', 'entregue', 'cancelado'];
  if (!statusValidos.includes(novoStatus)) {
    res.status(400).json({ type: 'https://example.com/erros/status-invalido', title: 'Status invalido', status: 400, detail: 'Status deve ser um de: ' + statusValidos.join(', ') });
    return;
  }

  try {
    var result = await pool.query('SELECT id, status FROM pedidos_read_model WHERE id = $1', [pedidoId]);
    if (result.rows.length === 0) {
      res.status(404).json({ type: 'https://example.com/erros/pedido-nao-encontrado', title: 'Pedido nao encontrado', status: 404, detail: 'Nao existe pedido com o ID ' + pedidoId });
      return;
    }

    var statusAnterior = result.rows[0].status;

    await publicarStatusAlterado({ pedidoId: pedidoId, statusAnterior: statusAnterior, novoStatus: novoStatus, alteradoEm: new Date().toISOString(), observacao: observacao || null });

    // Metricas
    statusAlterados.inc({ de: statusAnterior, para: novoStatus });

    logger.info('Status do pedido atualizado', { event: 'StatusAtualizado', pedidoId: pedidoId, statusAnterior: statusAnterior, novoStatus: novoStatus });

    res.status(200).json({ pedidoId: pedidoId, statusAnterior: statusAnterior, novoStatus: novoStatus, alteradoEm: new Date().toISOString() });

  } catch (error) {
    logger.error('Erro ao atualizar status', { event: 'StatusErro', error: String(error) });
    res.status(500).json({ detail: 'Erro ao atualizar status do pedido' });
  }
});

conectarRabbitMQ().catch(console.error);

export default app;