// ENTIDADE: Notificacao
// Possui identidade única (id) e representa uma comunicação enviada ao usuário

export type StatusNotificacao = 'PENDENTE' | 'ENVIADA' | 'FALHOU';
export type CanalNotificacao = 'EMAIL' | 'SMS';

export class Notificacao {
  private readonly id: string;
  private readonly usuarioId: string;
  private readonly canal: CanalNotificacao;
  private readonly assunto: string;
  private readonly mensagem: string;
  private status: StatusNotificacao;
  private readonly dataCriacao: Date;

  constructor(
    id: string,
    usuarioId: string,
    canal: CanalNotificacao,
    assunto: string,
    mensagem: string
  ) {
    if (!assunto || assunto.trim() === '') throw new Error('Assunto inválido');
    if (!mensagem || mensagem.trim() === '') throw new Error('Mensagem inválida');

    this.id = id;
    this.usuarioId = usuarioId;
    this.canal = canal;
    this.assunto = assunto;
    this.mensagem = mensagem;
    this.status = 'PENDENTE';
    this.dataCriacao = new Date();
  }

  getId(): string { return this.id; }
  getUsuarioId(): string { return this.usuarioId; }
  getCanal(): CanalNotificacao { return this.canal; }
  getAssunto(): string { return this.assunto; }
  getMensagem(): string { return this.mensagem; }
  getStatus(): StatusNotificacao { return this.status; }
  getDataCriacao(): Date { return this.dataCriacao; }

  marcarComoEnviada(): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Apenas notificações pendentes podem ser marcadas como enviadas');
    }
    this.status = 'ENVIADA';
  }

  marcarComoFalhou(): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Apenas notificações pendentes podem ser marcadas como falhou');
    }
    this.status = 'FALHOU';
  }
}