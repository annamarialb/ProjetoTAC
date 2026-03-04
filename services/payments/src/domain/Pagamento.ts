// ENTIDADE: Pagamento
// Possui identidade única (id) e representa uma transação financeira específica

export type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO';
export type MetodoPagamento = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO';

export class Pagamento {
  private readonly id: string;
  private readonly pedidoId: string;
  private readonly valor: number;
  private readonly metodoPagamento: MetodoPagamento;
  private status: StatusPagamento;
  private readonly dataCriacao: Date;

  constructor(
    id: string,
    pedidoId: string,
    valor: number,
    metodoPagamento: MetodoPagamento
  ) {
    if (valor <= 0) throw new Error('Valor do pagamento deve ser maior que zero');

    this.id = id;
    this.pedidoId = pedidoId;
    this.valor = valor;
    this.metodoPagamento = metodoPagamento;
    this.status = 'PENDENTE';
    this.dataCriacao = new Date();
  }

  getId(): string { return this.id; }
  getPedidoId(): string { return this.pedidoId; }
  getValor(): number { return this.valor; }
  getMetodoPagamento(): MetodoPagamento { return this.metodoPagamento; }
  getStatus(): StatusPagamento { return this.status; }
  getDataCriacao(): Date { return this.dataCriacao; }

  aprovar(): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Apenas pagamentos pendentes podem ser aprovados');
    }
    this.status = 'APROVADO';
  }

  recusar(): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Apenas pagamentos pendentes podem ser recusados');
    }
    this.status = 'RECUSADO';
  }

  estornar(): void {
    if (this.status !== 'APROVADO') {
      throw new Error('Apenas pagamentos aprovados podem ser estornados');
    }
    this.status = 'ESTORNADO';
  }
}