// ENTIDADE: Usuario
// Possui identidade única (id) e ciclo de vida longo

export class Usuario {
  private readonly id: string;
  private nome: string;
  private email: string;
  private senhaHash: string;

  constructor(id: string, nome: string, email: string, senhaHash: string) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senhaHash = senhaHash;
  }

  getId(): string {
    return this.id;
  }

  getNome(): string {
    return this.nome;
  }

  getEmail(): string {
    return this.email;
  }

  atualizarNome(novoNome: string): void {
    if (!novoNome || novoNome.trim() === '') {
      throw new Error('Nome não pode ser vazio');
    }
    this.nome = novoNome;
  }
}