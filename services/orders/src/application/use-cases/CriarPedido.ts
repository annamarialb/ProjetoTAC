// CASO DE USO: Criar Pedido

import { Pedido } from '../../domain/Pedido';
import { ItemPedido } from '../../domain/ItemPedido';
import { IOrderRepository } from '../ports/IOrderRepository';

interface ItemInput {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

interface CriarPedidoInput {
  id: string;
  usuarioId: string;
  itens: ItemInput[];
}

export class CriarPedido {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async executar(input: CriarPedidoInput): Promise<void> {
    if (input.itens.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    const pedido = new Pedido(input.id, input.usuarioId);

    for (const itemInput of input.itens) {
      const item = new ItemPedido(
        itemInput.produtoId,
        itemInput.nomeProduto,
        itemInput.quantidade,
        itemInput.precoUnitario
      );
      pedido.adicionarItem(item);
    }

    pedido.confirmar();

    await this.orderRepository.salvar(pedido);
  }
}