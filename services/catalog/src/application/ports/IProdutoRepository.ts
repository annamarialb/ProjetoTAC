// PORT: Interface do repositório de produtos

import { Produto } from '../../domain/Produto';

export interface IProdutoRepository {
  salvar(produto: Produto): Promise<void>;
  buscarPorId(id: string): Promise<Produto | null>;
  listarTodos(): Promise<Produto[]>;
  deletar(id: string): Promise<void>;
}
