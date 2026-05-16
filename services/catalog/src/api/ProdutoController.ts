import { Request, Response } from 'express';
import { Produto } from '../domain/Produto';
import { ProdutoCacheService, ProdutoDTO } from '../infrastructure/cache/ProdutoCacheService';

const produtos: Produto[] = [
  new Produto('1', 'Notebook', 'Notebook gamer', 3500, 10),
  new Produto('2', 'Mouse', 'Mouse sem fio', 120, 50),
];

// Função auxiliar: converte Produto do domínio para DTO do cache
function toDTO(p: Produto): ProdutoDTO {
  return {
    id: p.getId(),
    nome: p.getNome(),
    descricao: p.getDescricao(),
    preco: p.getPreco(),
    quantidadeEstoque: p.getQuantidadeEstoque(),
  };
}

export class ProdutoController {
  private cache: ProdutoCacheService;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://:redissenha123@localhost:6379';
    this.cache = new ProdutoCacheService(redisUrl);
  }

  // GET /api/v1/produtos — Cache-Aside na lista
  async listarTodos(req: Request, res: Response): Promise<void> {
    // 1. Verificar cache
    const cached = await this.cache.getLista();
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    // 2. Cache MISS — buscar no "banco" (array em memória)
    const lista = produtos.map(toDTO);

    // 3. Armazenar no cache com TTL de 2 min
    await this.cache.setLista(lista);

    res.status(200).json(lista);
  }

  // GET /api/v1/produtos/:id — Cache-Aside por ID
  async buscarPorId(req: Request, res: Response): Promise<void> {
   const id = req.params.id as string;

    // 1. Verificar cache
    const cached = await this.cache.getItem(id);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    // 2. Cache MISS — buscar no "banco"
    const produto = produtos.find(p => p.getId() === id);
    if (!produto) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto não encontrado',
        status: 404,
        detail: `Não existe produto com o ID ${id}`
      });
      return;
    }

    // 3. Armazenar no cache com TTL de 5 min
    const dto = toDTO(produto);
    await this.cache.setItem(dto);

    res.status(200).json(dto);
  }

  // POST /api/v1/produtos — Cria e invalida lista
  async criar(req: Request, res: Response): Promise<void> {
    const { nome, descricao, preco, quantidadeEstoque } = req.body;
    if (!nome || !preco) {
      res.status(400).json({
        type: 'https://example.com/erros/dados-invalidos',
        title: 'Dados inválidos',
        status: 400,
        detail: 'Os campos nome e preco são obrigatórios'
      });
      return;
    }
    const id = String(produtos.length + 1);
    const novoProduto = new Produto(id, nome, descricao, preco, quantidadeEstoque);
    produtos.push(novoProduto);

    // Invalidar lista (novo produto adicionado)
    await this.cache.invalidarLista();

    res.status(201).json(toDTO(novoProduto));
  }

  // PUT /api/v1/produtos/:id — Atualiza e invalida cache
  async atualizar(req: Request, res: Response): Promise<void> {
    const produto = produtos.find(p => p.getId() === req.params.id);
    if (!produto) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto não encontrado',
        status: 404,
        detail: `Não existe produto com o ID ${req.params.id}`
      });
      return;
    }
    const { preco } = req.body;
    if (preco) produto.atualizarPreco(preco);

    // Invalidação explícita APÓS a escrita (ordem crítica!)
    await this.cache.invalidar(req.params.id as string);

    res.status(200).json(toDTO(produto));
  }

  // DELETE /api/v1/produtos/:id — Deleta e invalida cache
  async deletar(req: Request, res: Response): Promise<void> {
    const index = produtos.findIndex(p => p.getId() === req.params.id);
    if (index === -1) {
      res.status(404).json({
        type: 'https://example.com/erros/produto-nao-encontrado',
        title: 'Produto não encontrado',
        status: 404,
        detail: `Não existe produto com o ID ${req.params.id}`
      });
      return;
    }
    const id = produtos[index].getId();
    produtos.splice(index, 1);

    // Invalidação explícita APÓS a deleção
    await this.cache.invalidar(id);

    res.status(204).send();
  }
}