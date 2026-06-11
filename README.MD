\# Plataforma de Gestao de Pedidos



\[!\[CI](https://github.com/annamarialb/ProjetoTAC/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/annamarialb/ProjetoTAC/actions/workflows/ci.yml)



\## Arquitetura



Plataforma de microsservicos para gestao de pedidos com comunicacao assincrona, cache distribuido e observabilidade.



\## Servicos



\- \*\*Gateway\*\* (porta 8000) - Ponto de entrada unico

\- \*\*Catalog\*\* (porta 3001) - CRUD de produtos com cache Redis

\- \*\*Orders\*\* (porta 3002) - Pedidos com CQRS, metricas e health checks

\- \*\*Notifications\*\* (porta 3003) - Consumer RabbitMQ + WebSocket (Socket.IO)



\## Stack



\- Node.js / TypeScript

\- PostgreSQL / Redis / RabbitMQ

\- Docker Compose (9 containers)

\- Prometheus + Grafana

\- GitHub Actions (CI)



\## Como rodar



```bash

docker-compose up --build -d

docker-compose ps

```



\## Endpoints principais



\- GET /health - Health check com dependencias

\- GET /health/ready - Readiness check (PostgreSQL + RabbitMQ)

\- GET /metrics - Metricas Prometheus

\- GET /api/v1/version - Versao e ambiente



\## Versionamento



\- Conventional Commits com commitlint + Husky

\- SemVer automatizado com release-please

\- Estrategia Git Flow (main + develop)

