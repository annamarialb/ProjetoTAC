// ENTIDADE: Pedido (Aggregate Root)
// Raiz do Agregado — controla acesso aos ItemPedido

import { ItemPedido } from './ItemPedido';

export type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'ENTREGUE';

export class Pedido {
  private readonly id: string;
  private readonly usuarioId: string;
  private readonly dataPedido: Date;
  private status: StatusPedido;
  private itens: ItemPedido[];

  constructor(id: string, usuarioId: string) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.dataPedido = new Date();
    this.status = 'PENDENTE';
    this.itens = [];
  }

  getId(): string { return this.id; }
  getUsuarioId(): string { return this.usuarioId; }
  getDataPedido(): Date { return this.dataPedido; }
  getStatus(): StatusPedido { return this.status; }
  getItens(): ItemPedido[] { return [...this.itens]; }

  adicionarItem(item: ItemPedido): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Não é possível adicionar itens a um pedido já confirmado');
    }
    this.itens.push(item);
  }

  confirmar(): void {
    if (this.itens.length === 0) {
      throw new Error('Pedido não pode ser confirmado sem itens');
    }
    this.status = 'CONFIRMADO';
  }

  cancelar(): void {
    if (this.status === 'ENTREGUE') {
      throw new Error('Pedido entregue não pode ser cancelado');
    }
    this.status = 'CANCELADO';
  }

  calcularTotal(): number {
    return this.itens.reduce((total, item) => {
      return total + item.calcularSubtotal();
    }, 0);
  }
}