// CASO DE USO: Enviar Notificação

import { Notificacao, CanalNotificacao } from '../../domain/Notificacao';
import { INotificacaoRepository } from '../ports/INotificacaoRepository';

interface EnviarNotificacaoInput {
  id: string;
  usuarioId: string;
  canal: CanalNotificacao;
  assunto: string;
  mensagem: string;
}

export class EnviarNotificacao {
  constructor(private readonly notificacaoRepository: INotificacaoRepository) {}

  async executar(input: EnviarNotificacaoInput): Promise<void> {
    const notificacao = new Notificacao(
      input.id,
      input.usuarioId,
      input.canal,
      input.assunto,
      input.mensagem
    );

    notificacao.marcarComoEnviada();

    await this.notificacaoRepository.salvar(notificacao);
  }
}