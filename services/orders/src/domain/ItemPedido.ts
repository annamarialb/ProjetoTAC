// VALUE OBJECT: ItemPedido
// Imutável, definido por seus atributos, existe apenas dentro de um Pedido

export class ItemPedido {
  private readonly produtoId: string;
  private readonly nomeProduto: string;
  private readonly quantidade: number;
  private readonly precoUnitario: number;

  constructor(
    produtoId: string,
    nomeProduto: string,
    quantidade: number,
    precoUnitario: number
  ) {
    if (quantidade <= 0) throw new Error('Quantidade deve ser maior que zero');
    if (precoUnitario < 0) throw new Error('Preço não pode ser negativo');

    this.produtoId = produtoId;
    this.nomeProduto = nomeProduto;
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
  }

  getProdutoId(): string { return this.produtoId; }
  getNomeProduto(): string { return this.nomeProduto; }
  getQuantidade(): number { return this.quantidade; }
  getPrecoUnitario(): number { return this.precoUnitario; }

  calcularSubtotal(): number {
    return this.quantidade * this.precoUnitario;
  }

  equals(outro: ItemPedido): boolean {
    return this.produtoId === outro.produtoId &&
           this.quantidade === outro.quantidade &&
           this.precoUnitario === outro.precoUnitario;
  }
}