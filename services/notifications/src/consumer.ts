import * as amqplib from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function conectar(tentativa = 1): Promise<amqplib.ChannelModel> {
  try {
    console.log(`🔌 Tentando conectar ao RabbitMQ (tentativa ${tentativa})...`);
    const connection = await amqplib.connect(RABBITMQ_URL);
    console.log('✅ Conectado ao RabbitMQ!');
    return connection;
  } catch (error) {
    if (tentativa >= 10) throw error;
    console.log(`⏳ RabbitMQ não disponível. Aguardando 3s...`);
    await new Promise(r => setTimeout(r, 3000));
    return conectar(tentativa + 1);
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

  console.log(`📬 Aguardando mensagens na fila: ${queue}`);

  channel.consume(queue, (msg: amqplib.ConsumeMessage | null) => {
    if (!msg) return;

    try {
      const evento = JSON.parse(msg.content.toString());

      console.log('📨 PedidoCriadoEvent recebido!');
      console.log(`[E-MAIL SIMULADO] Para: ${evento.usuarioId}`);
      console.log(`   Pedido ID: ${evento.id}`);
      console.log(`   Total: R$ ${evento.total}`);
      console.log(`   Itens: ${JSON.stringify(evento.itens)}`);

      channel.ack(msg);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      channel.nack(msg, false, false);
    }
  });
}