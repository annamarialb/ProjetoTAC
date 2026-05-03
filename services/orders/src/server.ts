import app from './app';

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Orders Service rodando na porta ${PORT}`);
});