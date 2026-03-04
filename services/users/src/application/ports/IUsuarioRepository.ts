// PORT: Interface do repositório de usuários
// A camada de domínio depende desta interface, não da implementação concreta

import { Usuario } from '../../domain/Usuario';

export interface IUsuarioRepository {
  salvar(usuario: Usuario): Promise<void>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  deletar(id: string): Promise<void>;
}