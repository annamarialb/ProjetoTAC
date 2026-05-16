import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { iniciarConsumer } from './consumer';

const app = express();
const PORT = 3003;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado: ' + socket.id);

  socket.on('AssinarPedido', (pedidoId: string) => {
    const room = 'pedido:' + pedidoId;
    socket.join(room);
    console.log('Cliente ' + socket.id + ' assinou pedido ' + pedidoId);
    socket.emit('AssinaturaConfirmada', pedidoId);
  });

  socket.on('CancelarAssinatura', (pedidoId: string) => {
    const room = 'pedido:' + pedidoId;
    socket.leave(room);
    console.log('Cliente ' + socket.id + ' cancelou assinatura do pedido ' + pedidoId);
  });

  socket.on('disconnect', (reason) => {
    console.log('Cliente desconectado: ' + socket.id + '. Motivo: ' + reason);
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notifications' });
});

export { io };

httpServer.listen(PORT, () => {
  console.log('Notifications Service rodando na porta ' + PORT);
  console.log('WebSocket disponivel em ws://localhost:' + PORT);
});

iniciarConsumer().catch(console.error);