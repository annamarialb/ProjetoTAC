# Changelog

## [0.2.0](https://github.com/annamarialb/ProjetoTAC/compare/v0.1.0...v0.2.0) (2026-06-11)


### Novas Funcionalidades

* adiciona comunicacao em tempo real com WebSocket (Socket.IO) e evento PedidoStatusAlterado ([6c56909](https://github.com/annamarialb/ProjetoTAC/commit/6c569098dffd9d4854ee7093d78f5ebbbdacfd5f))
* adiciona mensageria com RabbitMQ - serviço notifications consome PedidoCriadoEvent ([cba505d](https://github.com/annamarialb/ProjetoTAC/commit/cba505d5c02c39cdce84ce45902f563cc74e2611))
* adiciona observabilidade (winston, health checks, prometheus, grafana) e resiliencia (retry, circuit breaker) ([f101989](https://github.com/annamarialb/ProjetoTAC/commit/f101989da9e1c75eb566dc990d2c94f7d67b0fbc))
* adiciona serviço orders e gateway com comunicação HTTP entre microsserviços ([369dd51](https://github.com/annamarialb/ProjetoTAC/commit/369dd5176800dc3bf6e249f0af933cfb99baa6c4))
* adiciona testes de integracao para cache Redis e WebSocket, screenshots em docs ([281cd3f](https://github.com/annamarialb/ProjetoTAC/commit/281cd3f5c1efd04a95316c162b31eb58b175d487))
* **catalog:** adiciona Dockerfile e docker-compose para containerização do serviço ([7735420](https://github.com/annamarialb/ProjetoTAC/commit/7735420fa9e69afa9ba4d923371089c8eb873aee))
* **catalog:** adiciona testes de integração para API de produtos e rotas POST, PUT, DELETE ([42f48ee](https://github.com/annamarialb/ProjetoTAC/commit/42f48ee63957a1ec400a6fe97ca94099dbf6b7be))
* **catalog:** adiciona testes unitários para Produto e CriarProduto ([1317a4b](https://github.com/annamarialb/ProjetoTAC/commit/1317a4bcfc17f28624defa23638e48fd62c5aa7d))
* **catalog:** integra Redis como cache distribuído com padrão Cache-Aside e invalidação explícita ([fa818e4](https://github.com/annamarialb/ProjetoTAC/commit/fa818e4e66e61e2fa8654ed9a6f4da93cef16915))
* estrutura inicial da plataforma de pedidos com Clean Architecture e DDD ([ecf22e6](https://github.com/annamarialb/ProjetoTAC/commit/ecf22e6a0caccb0aa8a8a94f4fafad79f9dbf995))
* implementa CQRS com Read Model no PostgreSQL e Projetor no notifications ([cd89397](https://github.com/annamarialb/ProjetoTAC/commit/cd8939737da6e1a243626147e09fa88daa102cb5))
* serviço de catálogo com CRUD, Swagger e tratamento de erros padronizado RFC 9457 ([05546d7](https://github.com/annamarialb/ProjetoTAC/commit/05546d71493bff9dce16c24f304588174e62e28c))

## 0.1.0 (2026-06-11)

### Novas Funcionalidades

* feat(catalogo): servico de catalogo com CRUD de produtos
* feat(pedidos): servico de pedidos com CQRS e Read Model
* feat(notificacoes): consumer RabbitMQ com projecao e WebSocket
* feat(catalogo): cache distribuido com Redis (Cache-Aside)
* feat(infra): observabilidade com winston, health checks, prometheus e grafana
* feat(infra): resiliencia com retry e circuit breaker
