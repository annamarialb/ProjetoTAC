import * as amqplib from 'amqplib';
import { Pool } from 'pg';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';

const pool = new Pool({ connectionString: PG_CONNECTION });

async function conectar(tentativa = 1): Promise<amqplib.ChannelModel> {
  try {
    console.log(`Tentando conectar ao RabbitMQ (tentativa ${tentativa})...`);
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

export async function iniciarConsumer(): Promise<void> {
  const connection = await conectar();
  const channel = await connection.createChannel();
  const exchange = 'pedido-criado-exchange';
  const queue = 'notifications-pedido-criado';
  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');
  console.log('Aguardando mensagens na fila: ' + queue);
  channel.consume(queue, async (msg: amqplib.ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const evento = JSON.parse(msg.content.toString());
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
}
