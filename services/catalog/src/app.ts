import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import produtoRoutes from './api/routes/produtoRoutes';

const app = express();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Catalog Service API',
      version: '1.0.0',
      description: 'API do serviço de Catálogo - Plataforma de Gestão de Pedidos',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/api/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1/produtos', produtoRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'catalog' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    type: 'https://example.com/erros/erro-interno',
    title: 'Erro interno do servidor',
    status: 500,
    detail: err.message
  });
});

export default app;