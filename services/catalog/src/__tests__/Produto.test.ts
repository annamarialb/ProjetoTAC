// Teste Unitário — Entidade Produto
// Padrão AAA: Arrange, Act, Assert

import { Produto } from '../domain/Produto';

describe('Produto', () => {

  describe('Criação', () => {

    it('deve criar um produto válido com dados corretos', () => {
      // Arrange & Act
      const produto = new Produto('1', 'Notebook', 'Notebook gamer', 2500, 10);

      // Assert
      expect(produto.getId()).toBe('1');
      expect(produto.getNome()).toBe('Notebook');
      expect(produto.getDescricao()).toBe('Notebook gamer');
      expect(produto.getPreco()).toBe(2500);
      expect(produto.getQuantidadeEstoque()).toBe(10);
    });

    it('deve lançar erro ao criar produto com preço negativo', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Produto('1', 'Notebook', 'Desc', -100, 10);
      }).toThrow('Preço não pode ser negativo');
    });

    it('deve lançar erro ao criar produto com estoque negativo', () => {
      expect(() => {
        new Produto('1', 'Notebook', 'Desc', 100, -5);
      }).toThrow('Estoque não pode ser negativo');
    });

  });

  describe('atualizarPreco', () => {

    it('deve atualizar o preço com valor válido', () => {
      // Arrange
      const produto = new Produto('1', 'Notebook', 'Desc', 2500, 10);

      // Act
      produto.atualizarPreco(3000);

      // Assert
      expect(produto.getPreco()).toBe(3000);
    });

    it('deve lançar erro ao atualizar preço com valor negativo', () => {
      // Arrange
      const produto = new Produto('1', 'Notebook', 'Desc', 2500, 10);

      // Act & Assert
      expect(() => produto.atualizarPreco(-1)).toThrow('Preço não pode ser negativo');
    });

  });

  describe('reduzirEstoque', () => {

    it('deve reduzir o estoque corretamente', () => {
      // Arrange
      const produto = new Produto('1', 'Notebook', 'Desc', 2500, 10);

      // Act
      produto.reduzirEstoque(3);

      // Assert
      expect(produto.getQuantidadeEstoque()).toBe(7);
    });

    it('deve lançar erro quando quantidade for maior que o estoque', () => {
      // Arrange
      const produto = new Produto('1', 'Notebook', 'Desc', 2500, 5);

      // Act & Assert
      expect(() => produto.reduzirEstoque(10)).toThrow('Estoque insuficiente');
    });

  });

});