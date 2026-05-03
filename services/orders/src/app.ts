import express from 'express';

const app = express();
app.use(express.json());

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'orders' });
});

// Rota para criar pedido — consulta o catalog via HTTP
app.post('/api/v1/pedidos', async (req, res) => {
  const { usuarioId, produtoId, quantidade } = req.body;

  if (!usuarioId || !produtoId || !quantidade) {
    res.status(400).json({
      type: 'https://example.com/erros/dados-invalidos',
      title: 'Dados inválidos',
      status: 400,
      detail: 'Os campos usuarioId, produtoId e quantidade são obrigatórios'
    });
    return;
  }

  try {
    // Comunicação síncrona HTTP com o serviço catalog
    const catalogUrl = process.env.CATALOG_URL || 'http://localhost:3001';
    const response = await fetch(`${catalogUrl}/api/v1/produtos/${produtoId}`);

    if (!response.ok) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto não encontrado no Catálogo',
        status: 404,
        detail: `Não existe produto com o ID ${produtoId}`
      });
      return;
    }

    const produto = await response.json() as any;

    // Cria o pedido com os dados do produto
    const pedido = {
      id: crypto.randomUUID(),
      usuarioId,
      status: 'confirmado',
      itens: [
        {
          produtoId,
          nomeProduto: produto.nome,
          quantidade,
          precoUnitario: produto.preco
        }
      ],
      total: produto.preco * quantidade,
      criadoEm: new Date().toISOString()
    };

    res.status(201).json(pedido);

  } catch (error) {
    res.status(503).json({
      type: 'https://example.com/erros/servico-indisponivel',
      title: 'Serviço de Catálogo indisponível',
      status: 503,
      detail: 'Não foi possível consultar o Catálogo. Tente novamente.'
    });
  }
});

// Rota para listar pedidos (simulação)
app.get('/api/v1/pedidos', (req, res) => {
  res.status(200).json([]);
});

export default app;