# API de Biblioteca Digital

Uma solução backend robusta e escalável para a automação e gerenciamento de acervos literários, fluxos de usuários e controle dinâmico de empréstimos.

## Proposta do Projeto e Objetivos Técnicos

O objetivo principal desta API é resolver um dos problemas mais críticos em sistemas de gerenciamento de inventário compartilhado: a **concorrência de dados e consistência de estoque**. Em uma biblioteca real, se dois usuários tentarem reservar a última unidade física de um livro exatamente ao mesmo milissegundo, o sistema não pode permitir que ambos concluam a operação.

Para resolver esse cenário do mundo real, o projeto foi desenhado sob os seguintes pilares:

### 1. Integridade Transacional Avançada (ACID)
**Transações SQL puras (`BEGIN`, `COMMIT`, `ROLLBACK`)** combinadas com a cláusula **`FOR UPDATE`** (Row-Level Locking). Quando uma requisição de empréstimo inicia, a linha daquele livro específico no banco de dados é bloqueada temporariamente para escrita. Se o estoque for suficiente, o registro de empréstimo é criado e o débito no estoque é feito de forma completa. Se qualquer etapa falhar, o banco desfaz tudo automaticamente, eliminando o risco de "estoque negativo".

### 2. Separação de Responsabilidades (Padrão MVC)
A arquitetura foi projetada para ser modular e fácil de manter:
*   **Camada de Rotas (`server.js`):** Atua como o gateway de entrada, interceptando os verbos HTTP corretos e direcionando o tráfego.
*   **Controllers:** Responsáveis exclusivamente por validar as regras de entrada da requisição (`HTTP Status 400` para dados inválidos) e formatar as respostas JSON enviadas ao cliente.
*   **Models:** Onde reside toda a inteligência de persistência de dados. Nenhuma query SQL vaza para as camadas superiores, garantindo que se o banco de dados mudar no futuro, os controladores permaneçam intactos.

### 3. Otimização de Performance
O banco de dados conta com a criação estratégica de **Índices B-Tree (`CREATE INDEX`)** na tabela de livros pelo campo `titulo`. Isso transforma buscas que seriam feitas por varredura completa na tabela (Sequence Scan) em buscas indexadas de alta velocidade (Index Scan), preparando a API para lidar com dezenas de milhares de registros sem perda de performance.
