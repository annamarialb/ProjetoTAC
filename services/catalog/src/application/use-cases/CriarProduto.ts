// CASO DE USO: Criar Produto

import { Produto } from '../../domain/Produto';
import { IProdutoRepository } from '../ports/IProdutoRepository';

interface CriarProdutoInput {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeEstoque: number;
}

export class CriarProduto {
  constructor(private readonly produtoRepository: IProdutoRepository) {}

  async executar(input: CriarProdutoInput): Promise<void> {
    const produto = new Produto(
      input.id,
      input.nome,
      input.descricao,
      input.preco,
      input.quantidadeEstoque
    );

    await this.produtoRepository.salvar(produto);
  }
}