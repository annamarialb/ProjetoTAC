// Teste Unitário — Caso de Uso CriarProduto
// Usa Mock do IProdutoRepository para isolar dependências

import { CriarProduto } from '../application/use-cases/CriarProduto';
import { IProdutoRepository } from '../application/ports/IProdutoRepository';
import { Produto } from '../domain/Produto';

describe('CriarProduto', () => {

  it('deve chamar o repositório com o produto correto', async () => {
    // Arrange
    const mockRepository: IProdutoRepository = {
      salvar: jest.fn().mockResolvedValue(undefined),
      buscarPorId: jest.fn(),
      listarTodos: jest.fn(),
      deletar: jest.fn()
    };

    const casoDeUso = new CriarProduto(mockRepository);

    const input = {
      id: '1',
      nome: 'Notebook',
      descricao: 'Notebook gamer',
      preco: 2500,
      quantidadeEstoque: 10
    };

    // Act
    await casoDeUso.executar(input);

    // Assert
    expect(mockRepository.salvar).toHaveBeenCalledTimes(1);
    expect(mockRepository.salvar).toHaveBeenCalledWith(
      expect.objectContaining({} )
    );
  });

  it('deve lançar erro se o preço for negativo (validação do domínio)', async () => {
    // Arrange
    const mockRepository: IProdutoRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      listarTodos: jest.fn(),
      deletar: jest.fn()
    };

    const casoDeUso = new CriarProduto(mockRepository);

    const inputInvalido = {
      id: '2',
      nome: 'Produto Inválido',
      descricao: 'Desc',
      preco: -50,
      quantidadeEstoque: 10
    };

    // Act & Assert
    await expect(casoDeUso.executar(inputInvalido))
      .rejects
      .toThrow('Preço não pode ser negativo');

    // Garante que o repositório NÃO foi chamado
    expect(mockRepository.salvar).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o estoque for negativo (validação do domínio)', async () => {
    // Arrange
    const mockRepository: IProdutoRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      listarTodos: jest.fn(),
      deletar: jest.fn()
    };

    const casoDeUso = new CriarProduto(mockRepository);

    const inputInvalido = {
      id: '3',
      nome: 'Produto Inválido',
      descricao: 'Desc',
      preco: 100,
      quantidadeEstoque: -1
    };

    // Act & Assert
    await expect(casoDeUso.executar(inputInvalido))
      .rejects
      .toThrow('Estoque não pode ser negativo');

    expect(mockRepository.salvar).not.toHaveBeenCalled();
  });

});