// PORT: Interface do repositório de pagamentos

import { Pagamento } from '../../domain/Pagamento';

export interface IPagamentoRepository {
  salvar(pagamento: Pagamento): Promise<void>;
  buscarPorId(id: string): Promise<Pagamento | null>;
  buscarPorPedidoId(pedidoId: string): Promise<Pagamento | null>;
}
