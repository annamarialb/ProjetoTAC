import express from 'express';
import { iniciarConsumer } from './consumer';

const app = express();
const PORT = 3003;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notifications' });
});

app.listen(PORT, () => {
  console.log(`✅ Notifications Service rodando na porta ${PORT}`);
});

// Inicia o consumer do RabbitMQ
iniciarConsumer().catch(console.error);
