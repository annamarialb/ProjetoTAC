// CASO DE USO: Criar Usuário
// Orquestra a criação de um novo usuário no sistema

import { Usuario } from '../../domain/Usuario';
import { IUsuarioRepository } from '../ports/IUsuarioRepository';

interface CriarUsuarioInput {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
}

export class CriarUsuario {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async executar(input: CriarUsuarioInput): Promise<void> {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(input.email);

    if (usuarioExistente) {
      throw new Error('Já existe um usuário com este e-mail');
    }

    const usuario = new Usuario(
      input.id,
      input.nome,
      input.email,
      input.senhaHash
    );

    await this.usuarioRepository.salvar(usuario);
  }
}