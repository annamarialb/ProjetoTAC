import logger from '../logging/logger';

var circuitOpen = false;
var failures = 0;
var lastFailTime = 0;

export async function resilientFetch(url: string): Promise<Response> {
  // Circuit Breaker check
  if (circuitOpen) {
    if (Date.now() - lastFailTime < 30000) {
      logger.warn('Circuit Breaker ABERTO', { event: 'CircuitOpen', url: url });
      throw new Error('Circuit Breaker aberto');
    }
    logger.info('Circuit Breaker HALF-OPEN', { event: 'CircuitHalfOpen', url: url });
  }

  // Retry com 3 tentativas
  var maxRetries = 3;
  for (var i = 0; i <= maxRetries; i++) {
    try {
      var response = await fetch(url);
      if (response.ok) {
        if (circuitOpen) {
          logger.info('Circuit Breaker FECHADO', { event: 'CircuitClosed' });
          circuitOpen = false;
          failures = 0;
        }
        return response;
      }
      if (response.status === 503) {
        throw new Error('Servico retornou 503');
      }
      return response;
    } catch (error: any) {
      failures++;
      if (i < maxRetries) {
        var delay = 500 * Math.pow(2, i);
        logger.warn('Retry ' + (i + 1) + '/' + maxRetries, { event: 'Retry', url: url, delay: delay });
        await new Promise(r => setTimeout(r, delay));
      } else {
        if (failures >= 5) {
          circuitOpen = true;
          lastFailTime = Date.now();
          logger.error('Circuit Breaker ABERTO apos ' + failures + ' falhas', { event: 'CircuitOpened' });
        }
        throw error;
      }
    }
  }
  throw new Error('Falha apos todas as tentativas');
}