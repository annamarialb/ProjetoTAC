// ENTIDADE: Categoria
// Possui identidade única (id)

export class Categoria {
  private readonly id: string;
  private nome: string;

  constructor(id: string, nome: string) {
    if (!nome || nome.trim() === '') {
      throw new Error('Nome da categoria não pode ser vazio');
    }
    this.id = id;
    this.nome = nome;
  }

  getId(): string { return this.id; }
  getNome(): string { return this.nome; }

  atualizarNome(novoNome: string): void {
    if (!novoNome || novoNome.trim() === '') {
      throw new Error('Nome da categoria não pode ser vazio');
    }
    this.nome = novoNome;
  }
}