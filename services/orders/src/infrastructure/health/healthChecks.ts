import { Router } from 'express';
import { Pool } from 'pg';
import logger from '../logging/logger';

var router = Router();

var PG_CONNECTION = process.env.PG_CONNECTION || 'postgresql://admin:senha123@localhost:5432/plataforma_pedidos';
var pool = new Pool({ connectionString: PG_CONNECTION });

async function checkPostgres(): Promise<{ status: string; duration: string }> {
  var start = Date.now();
  try {
    await pool.query('SELECT 1');
    var duration = Date.now() - start;
    return { status: 'Healthy', duration: duration + 'ms' };
  } catch (error) {
    var duration = Date.now() - start;
    return { status: 'Unhealthy', duration: duration + 'ms' };
  }
}

async function checkRabbitMQ(): Promise<{ status: string; duration: string }> {
  var start = Date.now();
  try {
    var amqplib = require('amqplib');
    var RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    var conn = await amqplib.connect(RABBITMQ_URL);
    await conn.close();
    var duration = Date.now() - start;
    return { status: 'Healthy', duration: duration + 'ms' };
  } catch (error) {
    var duration = Date.now() - start;
    return { status: 'Unhealthy', duration: duration + 'ms' };
  }
}

// /health/live - processo esta vivo?
router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'Healthy', service: 'orders' });
});

// /health/ready - dependencias estao prontas?
router.get('/health/ready', async (req, res) => {
  var postgres = await checkPostgres();
  var rabbitmq = await checkRabbitMQ();

  var overallStatus = (postgres.status === 'Healthy' && rabbitmq.status === 'Healthy')
    ? 'Healthy' : 'Unhealthy';

  var statusCode = overallStatus === 'Healthy' ? 200 : 503;

  logger.info('Health check executado', {
    event: 'HealthCheck',
    status: overallStatus,
    entries: { postgres: postgres, rabbitmq: rabbitmq }
  });

  res.status(statusCode).json({
    status: overallStatus,
    entries: {
      postgres: postgres,
      rabbitmq: rabbitmq
    }
  });
});

// /health - completo
router.get('/health', async (req, res) => {
  var postgres = await checkPostgres();
  var rabbitmq = await checkRabbitMQ();

  var overallStatus = (postgres.status === 'Healthy' && rabbitmq.status === 'Healthy')
    ? 'Healthy' : 'Unhealthy';

  var statusCode = overallStatus === 'Healthy' ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    service: 'orders',
    entries: {
      postgres: postgres,
      rabbitmq: rabbitmq
    }
  });
});

export default router;