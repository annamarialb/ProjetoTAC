// VALUE OBJECT: Mensagem
// Imutável, definida por seus atributos (canal, template, conteúdo)

export class Mensagem {
  private readonly destinatario: string;
  private readonly template: string;
  private readonly conteudo: string;

  constructor(
    destinatario: string,
    template: string,
    conteudo: string
  ) {
    if (!destinatario || destinatario.trim() === '') {
      throw new Error('Destinatário inválido');
    }
    if (!conteudo || conteudo.trim() === '') {
      throw new Error('Conteúdo da mensagem não pode ser vazio');
    }

    this.destinatario = destinatario;
    this.template = template;
    this.conteudo = conteudo;
  }

  getDestinatario(): string { return this.destinatario; }
  getTemplate(): string { return this.template; }
  getConteudo(): string { return this.conteudo; }

  equals(outra: Mensagem): boolean {
    return this.destinatario === outra.destinatario &&
           this.template === outra.template &&
           this.conteudo === outra.conteudo;
  }
}