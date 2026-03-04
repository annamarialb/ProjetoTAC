// PORT: Interface do repositório de pedidos

import { Pedido } from '../../domain/Pedido';

export interface IOrderRepository {
  salvar(pedido: Pedido): Promise<void>;
  buscarPorId(id: string): Promise<Pedido | null>;
  buscarPorUsuarioId(usuarioId: string): Promise<Pedido[]>;
  deletar(id: string): Promise<void>;
}