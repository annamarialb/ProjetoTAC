// VALUE OBJECT: Credenciais
// Imutável, definido por seus atributos, sem identidade própria

export class Credenciais {
  private readonly email: string;
  private readonly senhaHash: string;

  constructor(email: string, senhaHash: string) {
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    this.email = email;
    this.senhaHash = senhaHash;
  }

  getEmail(): string {
    return this.email;
  }

  getSenhaHash(): string {
    return this.senhaHash;
  }

  // Value Objects são iguais se seus atributos forem iguais
  equals(outras: Credenciais): boolean {
    return this.email === outras.email && this.senhaHash === outras.senhaHash;
  }
}