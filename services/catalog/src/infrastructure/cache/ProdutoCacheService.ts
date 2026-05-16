import Redis from 'ioredis';

export interface ProdutoDTO {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidadeEstoque: number;
}

export class ProdutoCacheService {
  private readonly redis: Redis;
  private readonly PREFIX = 'GestaoPedidos:produto:';
  private readonly ITEM_TTL = 300;   // 5 minutos em segundos
  private readonly LISTA_TTL = 120;  // 2 minutos em segundos

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);

    this.redis.on('connect', () => {
      console.log('✅ Conectado ao Redis');
    });

    this.redis.on('error', (err) => {
      console.error('❌ Erro no Redis:', err.message);
    });
  }

  // --- Cache-Aside: LEITURA por ID ---
  async getItem(id: string): Promise<ProdutoDTO | null> {
    const chave = `${this.PREFIX}item:${id}`;
    const dados = await this.redis.get(chave);

    if (!dados) {
      console.log(`Cache MISS: ${chave}`);
      return null;
    }

    console.log(`Cache HIT: ${chave}`);
    return JSON.parse(dados);
  }

  // --- Cache-Aside: ESCRITA após leitura do banco ---
  async setItem(produto: ProdutoDTO): Promise<void> {
    const chave = `${this.PREFIX}item:${produto.id}`;
    await this.redis.set(chave, JSON.stringify(produto), 'EX', this.ITEM_TTL);
    console.log(`Cache SET: ${chave} (TTL: ${this.ITEM_TTL}s)`);
  }

  // --- Cache da lista completa ---
  async getLista(): Promise<ProdutoDTO[] | null> {
    const chave = `${this.PREFIX}lista:todos`;
    const dados = await this.redis.get(chave);

    if (!dados) {
      console.log(`Cache MISS: ${chave}`);
      return null;
    }

    console.log(`Cache HIT: ${chave}`);
    return JSON.parse(dados);
  }

  async setLista(produtos: ProdutoDTO[]): Promise<void> {
    const chave = `${this.PREFIX}lista:todos`;
    await this.redis.set(chave, JSON.stringify(produtos), 'EX', this.LISTA_TTL);
    console.log(`Cache SET: ${chave} (TTL: ${this.LISTA_TTL}s)`);
  }

  // --- Invalidação explícita após escrita ---
  async invalidar(id: string): Promise<void> {
    const chaveItem = `${this.PREFIX}item:${id}`;
    const chaveLista = `${this.PREFIX}lista:todos`;

    await Promise.all([
      this.redis.del(chaveItem),
      this.redis.del(chaveLista),
    ]);

    console.log(`Cache INVALIDADO: produto ${id}`);
  }

  // --- Invalidar apenas a lista ---
  async invalidarLista(): Promise<void> {
    await this.redis.del(`${this.PREFIX}lista:todos`);
  }

  // --- Fechar conexão (para testes) ---
  async desconectar(): Promise<void> {
    await this.redis.quit();
  }
}