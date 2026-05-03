import app from './app';

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Gateway rodando na porta ${PORT}`);
  console.log(`📡 Catalog: /api/catalogo`);
  console.log(`📦 Orders:  /api/pedidos`);
});