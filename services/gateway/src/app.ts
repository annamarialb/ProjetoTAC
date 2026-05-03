import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';
const ORDERS_URL = process.env.ORDERS_URL || 'http://localhost:3002';

// Rota de saúde do gateway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway' });
});

// Rota para o serviço catalog
app.use('/api/catalogo', createProxyMiddleware({
  target: CATALOG_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/produtos/' }
}));

// Rota para o serviço orders
app.use('/api/pedidos', createProxyMiddleware({
  target: ORDERS_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/pedidos/' }
}));

export default app;