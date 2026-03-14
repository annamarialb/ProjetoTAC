import { Request, Response } from 'express';
import { Produto } from '../domain/Produto';

const produtos: Produto[] = [
  new Produto('1', 'Notebook', 'Notebook gamer', 3500, 10),
  new Produto('2', 'Mouse', 'Mouse sem fio', 120, 50),
];

export class ProdutoController {

  listarTodos(req: Request, res: Response): void {
    res.status(200).json(produtos);
  }

  buscarPorId(req: Request, res: Response): void {
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
    res.status(200).json(produto);
  }

  criar(req: Request, res: Response): void {
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
    res.status(201).json(novoProduto);
  }

  atualizar(req: Request, res: Response): void {
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
    res.status(200).json(produto);
  }

  deletar(req: Request, res: Response): void {
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
    produtos.splice(index, 1);
    res.status(204).send();
  }
}