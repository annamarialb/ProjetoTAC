import { ProdutoCacheService, ProdutoDTO } from '../infrastructure/cache/ProdutoCacheService';

describe('ProdutoCacheService - Integracao com Redis', () => {
  var cache: ProdutoCacheService;

  beforeAll(() => {
    var redisUrl = process.env.REDIS_URL || 'redis://:redissenha123@localhost:6379';
    cache = new ProdutoCacheService(redisUrl);
  });

  afterAll(async () => {
    await cache.desconectar();
  });

  var produto: ProdutoDTO = {
    id: 'test-' + Date.now(),
    nome: 'Teclado Mecanico',
    descricao: 'Switch Blue, ABNT2',
    preco: 299.90,
    quantidadeEstoque: 50
  };

  test('CacheAside - deve retornar null na primeira leitura (MISS)', async () => {
    var resultado = await cache.getItem(produto.id);
    expect(resultado).toBeNull();
  });

  test('CacheAside - deve armazenar e retornar produto (HIT)', async () => {
    await cache.setItem(produto);
    var resultado = await cache.getItem(produto.id);
    expect(resultado).not.toBeNull();
    expect(resultado!.nome).toBe('Teclado Mecanico');
    expect(resultado!.preco).toBe(299.90);
  });

  test('Invalidar - deve remover chave do Redis', async () => {
    await cache.setItem(produto);
    await cache.invalidar(produto.id);
    var resultado = await cache.getItem(produto.id);
    expect(resultado).toBeNull();
  });

  test('CacheAside Lista - deve cachear e retornar lista', async () => {
    var lista = [produto];
    await cache.setLista(lista);
    var resultado = await cache.getLista();
    expect(resultado).not.toBeNull();
    expect(resultado!.length).toBe(1);
    expect(resultado![0].nome).toBe('Teclado Mecanico');
  });

  test('Invalidar - deve remover lista ao invalidar produto', async () => {
    await cache.setLista([produto]);
    await cache.invalidar(produto.id);
    var resultado = await cache.getLista();
    expect(resultado).toBeNull();
  });
});