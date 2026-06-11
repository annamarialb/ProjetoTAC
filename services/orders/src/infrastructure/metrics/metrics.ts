import { Router } from 'express';
import client from 'prom-client';

var register = client.register;

// Metricas padrao do Node.js (GC, memory, event loop)
client.collectDefaultMetrics({ prefix: 'gestaopedidos_orders_' });

// Counter: total de pedidos criados
var pedidosCriados = new client.Counter({
  name: 'gestaopedidos_pedidos_criados_total',
  help: 'Total de pedidos criados na plataforma',
  labelNames: ['status']
});

// Counter: total de atualizacoes de status
var statusAlterados = new client.Counter({
  name: 'gestaopedidos_status_alterados_total',
  help: 'Total de atualizacoes de status de pedidos',
  labelNames: ['de', 'para']
});

// Histogram: latencia de criacao de pedido
var latenciaCriacao = new client.Histogram({
  name: 'gestaopedidos_pedido_criacao_duracao_segundos',
  help: 'Duracao do fluxo de criacao de pedido em segundos',
  buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
});

// Histogram: latencia de requisicoes HTTP
var latenciaHTTP = new client.Histogram({
  name: 'gestaopedidos_http_duracao_segundos',
  help: 'Duracao das requisicoes HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
});

// Gauge: pedidos ativos
var pedidosAtivos = new client.Gauge({
  name: 'gestaopedidos_pedidos_ativos',
  help: 'Numero de pedidos com status em_preparo ou enviado'
});

// Middleware para medir latencia de cada requisicao
function metricsMiddleware(req: any, res: any, next: any) {
  var start = Date.now();
  res.on('finish', () => {
    var duration = (Date.now() - start) / 1000;
    latenciaHTTP.observe(
      { method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode },
      duration
    );
  });
  next();
}

// Endpoint /metrics
var router = Router();
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export { router as metricsRouter, pedidosCriados, statusAlterados, latenciaCriacao, pedidosAtivos, metricsMiddleware };