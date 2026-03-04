// ENTIDADE: Produto
// Possui identidade única (id) e ciclo de vida longo

export class Produto {
  private readonly id: string;
  private nome: string;
  private descricao: string;
  private preco: number;
  private quantidadeEstoque: number;

  constructor(
    id: string,
    nome: string,
    descricao: string,
    preco: number,
    quantidadeEstoque: number
  ) {
    if (preco < 0) throw new Error('Preço não pode ser negativo');
    if (quantidadeEstoque < 0) throw new Error('Estoque não pode ser negativo');

    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.quantidadeEstoque = quantidadeEstoque;
  }

  getId(): string { return this.id; }
  getNome(): string { return this.nome; }
  getDescricao(): string { return this.descricao; }
  getPreco(): number { return this.preco; }
  getQuantidadeEstoque(): number { return this.quantidadeEstoque; }

  atualizarPreco(novoPreco: number): void {
    if (novoPreco < 0) throw new Error('Preço não pode ser negativo');
    this.preco = novoPreco;
  }

  reduzirEstoque(quantidade: number): void {
    if (quantidade > this.quantidadeEstoque) {
      throw new Error('Estoque insuficiente');
    }
    this.quantidadeEstoque -= quantidade;
  }
}