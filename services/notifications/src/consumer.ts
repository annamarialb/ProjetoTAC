import * as amqplib from 'amqplib';
import { Pool } from 'pg';
import { io } from './server';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';

const pool = new Pool({ connectionString: PG_CONNECTION });

async function conectar(tentativa = 1): Promise<amqplib.ChannelModel> {
  try {
    console.log('Tentando conectar ao RabbitMQ (tentativa ' + tentativa + ')...');
    const connection = await amqplib.connect(RABBITMQ_URL);
    console.log('Conectado ao RabbitMQ!');
    return connection;
  } catch (error) {
    if (tentativa >= 10) throw error;
    console.log('RabbitMQ nao disponivel. Aguardando 3s...');
    await new Promise(r => setTimeout(r, 3000));
    return conectar(tentativa + 1);
  }
}

async function projetarPedido(pedido: any): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existe = await client.query('SELECT id FROM pedidos_read_model WHERE id = $1', [pedido.id]);
    if (existe.rows.length > 0) {
      console.log('Pedido ja projetado - ignorando');
      await client.query('ROLLBACK');
      return;
    }
    await client.query(
      'INSERT INTO pedidos_read_model (id, usuario_id, status, total, criado_em) VALUES ($1, $2, $3, $4, $5)',
      [pedido.id, pedido.usuarioId, pedido.status, pedido.total, pedido.criadoEm]
    );
    for (const item of pedido.itens) {
      await client.query(
        'INSERT INTO itens_read_model (pedido_id, produto_id, nome_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4, $5)',
        [pedido.id, item.produtoId, item.nomeProduto, item.quantidade, item.precoUnitario]
      );
    }
    await client.query('COMMIT');
    console.log('Read Model atualizado para Pedido ' + pedido.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function atualizarStatusReadModel(pedidoId: string, novoStatus: string): Promise<void> {
  await pool.query(
    'UPDATE pedidos_read_model SET status = $1 WHERE id = $2',
    [novoStatus, pedidoId]
  );
  console.log('Read Model atualizado: pedido ' + pedidoId + ' -> ' + novoStatus);
}

export async function iniciarConsumer(): Promise<void> {
  const connection = await conectar();
  const channel = await connection.createChannel();

  var exchangeCriado = 'pedido-criado-exchange';
  var queueCriado = 'notifications-pedido-criado';
  await channel.assertExchange(exchangeCriado, 'fanout', { durable: true });
  await channel.assertQueue(queueCriado, { durable: true });
  await channel.bindQueue(queueCriado, exchangeCriado, '');
  console.log('Aguardando mensagens na fila: ' + queueCriado);

  channel.consume(queueCriado, async (msg: amqplib.ConsumeMessage | null) => {
    if (!msg) return;
    try {
      var evento = JSON.parse(msg.content.toString());
      console.log('[E-MAIL SIMULADO] Para: ' + evento.usuarioId);
      console.log('Pedido ID: ' + evento.id);
      console.log('Total: R$ ' + evento.total);
      await projetarPedido(evento);
      channel.ack(msg);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      channel.nack(msg, false, false);
    }
  });

  var exchangeStatus = 'pedido-status-alterado-exchange';
  var queueStatus = 'notifications-pedido-status';
  await channel.assertExchange(exchangeStatus, 'fanout', { durable: true });
  await channel.assertQueue(queueStatus, { durable: true });
  await channel.bindQueue(queueStatus, exchangeStatus, '');
  console.log('Aguardando mensagens na fila: ' + queueStatus);

  channel.consume(queueStatus, async (msg: amqplib.ConsumeMessage | null) => {
    if (!msg) return;
    try {
      var evento = JSON.parse(msg.content.toString());
      console.log('StatusAlterado recebido: pedido ' + evento.pedidoId + ' -> ' + evento.novoStatus);

      await atualizarStatusReadModel(evento.pedidoId, evento.novoStatus);

      var room = 'pedido:' + evento.pedidoId;
      io.to(room).emit('StatusAtualizado', {
        pedidoId: evento.pedidoId,
        status: evento.novoStatus,
        statusAnterior: evento.statusAnterior,
        alteradoEm: evento.alteradoEm,
        observacao: evento.observacao || null
      });

      console.log('Notificacao enviada via WebSocket para room ' + room);
      channel.ack(msg);
    } catch (error) {
      console.error('Erro ao processar status:', error);
      channel.nack(msg, false, false);
    }
  });
}