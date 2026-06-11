module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'pedidos', 'pagamentos', 'catalogo', 'usuarios',
      'notificacoes', 'gateway', 'domain', 'angular', 'infra', 'deps'
    ]],
    'subject-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case']
  }
};