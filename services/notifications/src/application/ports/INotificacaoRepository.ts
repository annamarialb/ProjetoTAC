// PORT: Interface do repositório de notificações

import { Notificacao } from '../../domain/Notificacao';

export interface INotificacaoRepository {
  salvar(notificacao: Notificacao): Promise<void>;
  buscarPorId(id: string): Promise<Notificacao | null>;
  buscarPorUsuarioId(usuarioId: string): Promise<Notificacao[]>;
}