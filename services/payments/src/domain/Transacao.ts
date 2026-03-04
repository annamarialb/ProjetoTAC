// VALUE OBJECT: Transacao
// Imutável, representa os detalhes de uma transação financeira

export class Transacao {
  private readonly codigoAutorizacao: string;
  private readonly dataTransacao: Date;
  private readonly valor: number;
  private readonly descricao: string;

  constructor(
    codigoAutorizacao: string,
    valor: number,
    descricao: string
  ) {
    if (!codigoAutorizacao || codigoAutorizacao.trim() === '') {
      throw new Error('Código de autorização inválido');
    }
    if (valor <= 0) throw new Error('Valor da transação deve ser maior que zero');

    this.codigoAutorizacao = codigoAutorizacao;
    this.dataTransacao = new Date();
    this.valor = valor;
    this.descricao = descricao;
  }

  getCodigoAutorizacao(): string { return this.codigoAutorizacao; }
  getDataTransacao(): Date { return this.dataTransacao; }
  getValor(): number { return this.valor; }
  getDescricao(): string { return this.descricao; }

  equals(outra: Transacao): boolean {
    return this.codigoAutorizacao === outra.codigoAutorizacao &&
           this.valor === outra.valor;
  }
}