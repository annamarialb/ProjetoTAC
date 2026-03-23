// Teste de Integração — API de Produtos
// Usa supertest para simular requisições HTTP sem subir o servidor real

import request from 'supertest';
import app from '../app';

describe('API /api/v1/produtos', () => {

  describe('GET /api/v1/produtos', () => {

    it('deve retornar status 200 e lista de produtos', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/produtos');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

  });

  describe('GET /api/v1/produtos/:id', () => {

    it('deve retornar status 200 e o produto quando ID existir', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/produtos/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nome', 'Notebook');
    });

    it('deve retornar status 404 quando produto não existir', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/produtos/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('title', 'Produto não encontrado');
    });

  });

  describe('POST /api/v1/produtos', () => {

    it('deve criar produto e retornar status 201', async () => {
      // Arrange
      const novoProduto = {
        nome: 'Teclado',
        descricao: 'Teclado mecânico',
        preco: 350,
        quantidadeEstoque: 20
      };

      // Act
      const response = await request(app)
        .post('/api/v1/produtos')
        .send(novoProduto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('nome', 'Teclado');
    });

    it('deve retornar status 400 quando nome estiver ausente', async () => {
      // Arrange
      const produtoInvalido = {
        descricao: 'Sem nome',
        preco: 100,
        quantidadeEstoque: 5
      };

      // Act
      const response = await request(app)
        .post('/api/v1/produtos')
        .send(produtoInvalido);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'Dados inválidos');
    });

  });

  describe('PUT /api/v1/produtos/:id', () => {

    it('deve atualizar o preço e retornar status 200', async () => {
      // Arrange & Act
      const response = await request(app)
        .put('/api/v1/produtos/1')
        .send({ preco: 4000 });

      // Assert
      expect(response.status).toBe(200);
    });

    it('deve retornar status 404 ao atualizar produto inexistente', async () => {
      // Arrange & Act
      const response = await request(app)
        .put('/api/v1/produtos/999')
        .send({ preco: 100 });

      // Assert
      expect(response.status).toBe(404);
    });

  });

  describe('DELETE /api/v1/produtos/:id', () => {

    it('deve deletar produto e retornar status 204', async () => {
      // Arrange & Act
      const response = await request(app).delete('/api/v1/produtos/2');

      // Assert
      expect(response.status).toBe(204);
    });

    it('deve retornar status 404 ao deletar produto inexistente', async () => {
      // Arrange & Act
      const response = await request(app).delete('/api/v1/produtos/999');

      // Assert
      expect(response.status).toBe(404);
    });

  });

  describe('GET /health', () => {

    it('deve retornar status 200 e status ok', async () => {
      // Arrange & Act
      const response = await request(app).get('/health');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'catalog');
    });

  });

});