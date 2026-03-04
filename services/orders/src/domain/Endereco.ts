// VALUE OBJECT: Endereco
// Imutável, dois endereços são iguais se todos os atributos forem iguais

export class Endereco {
  private readonly rua: string;
  private readonly numero: string;
  private readonly bairro: string;
  private readonly cidade: string;
  private readonly estado: string;
  private readonly cep: string;

  constructor(
    rua: string,
    numero: string,
    bairro: string,
    cidade: string,
    estado: string,
    cep: string
  ) {
    if (!cep || cep.trim() === '') throw new Error('CEP inválido');
    if (!cidade || cidade.trim() === '') throw new Error('Cidade inválida');

    this.rua = rua;
    this.numero = numero;
    this.bairro = bairro;
    this.cidade = cidade;
    this.estado = estado;
    this.cep = cep;
  }

  getRua(): string { return this.rua; }
  getNumero(): string { return this.numero; }
  getBairro(): string { return this.bairro; }
  getCidade(): string { return this.cidade; }
  getEstado(): string { return this.estado; }
  getCep(): string { return this.cep; }

  equals(outro: Endereco): boolean {
    return this.rua === outro.rua &&
           this.numero === outro.numero &&
           this.bairro === outro.bairro &&
           this.cidade === outro.cidade &&
           this.estado === outro.estado &&
           this.cep === outro.cep;
  }

  toString(): string {
    return `${this.rua}, ${this.numero} - ${this.bairro}, ${this.cidade}/${this.estado} - CEP: ${this.cep}`;
  }
}