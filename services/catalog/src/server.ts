import app from './app';

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Catalog Service rodando na porta ${PORT}`);
  console.log(`📄 Swagger disponível em http://localhost:${PORT}/api-docs`);
});
