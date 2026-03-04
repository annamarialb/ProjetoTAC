// CASO DE USO: Processar Pagamento

import { Pagamento, MetodoPagamento } from '../../domain/Pagamento';
import { IPagamentoRepository } from '../ports/IPagamentoRepository';

interface ProcessarPagamentoInput {
  id: string;
  pedidoId: string;
  valor: number;
  metodoPagamento: MetodoPagamento;
}

export class ProcessarPagamento {
  constructor(private readonly pagamentoRepository: IPagamentoRepository) {}

  async executar(input: ProcessarPagamentoInput): Promise<void> {
    const pagamentoExistente = await this.pagamentoRepository.buscarPorPedidoId(input.pedidoId);

    if (pagamentoExistente) {
      throw new Error('Já existe um pagamento para este pedido');
    }

    const pagamento = new Pagamento(
      input.id,
      input.pedidoId,
      input.valor,
      input.metodoPagamento
    );

    // Simulação de aprovação automática
    pagamento.aprovar();

    await this.pagamentoRepository.salvar(pagamento);
  }
}