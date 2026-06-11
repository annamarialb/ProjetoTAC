import { Router } from 'express';

var router = Router();

var APP_VERSION = process.env.APP_VERSION || '0.1.0';
var NODE_ENV = process.env.NODE_ENV || 'development';

router.get('/api/v1/version', (req, res) => {
  res.status(200).json({
    version: APP_VERSION,
    environment: NODE_ENV,
    buildDate: new Date().toISOString(),
    service: 'orders'
  });
});

export default router;