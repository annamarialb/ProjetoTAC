// VALUE OBJECT: Dinheiro
// Imutável, definido por valor e moeda

export class Dinheiro {
  private readonly valor: number;
  private readonly moeda: string;

  constructor(valor: number, moeda: string) {
    if (valor < 0) throw new Error('Valor não pode ser negativo');
    if (!moeda || moeda.trim() === '') throw new Error('Moeda inválida');

    this.valor = valor;
    this.moeda = moeda;
  }

  getValor(): number { return this.valor; }
  getMoeda(): string { return this.moeda; }

  equals(outro: Dinheiro): boolean {
    return this.valor === outro.valor && this.moeda === outro.moeda;
  }

  somar(outro: Dinheiro): Dinheiro {
    if (this.moeda !== outro.moeda) {
      throw new Error('Não é possível somar moedas diferentes');
    }
    return new Dinheiro(this.valor + outro.valor, this.moeda);
  }
}