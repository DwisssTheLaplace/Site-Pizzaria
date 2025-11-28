# Pizzaria Type & Dough

Bem-vindo à Pizzaria Type & Dough, uma aplicação web full-stack completa para gerenciamento de uma pizzaria. Este projeto inclui um cardápio dinâmico, sistema de pedidos online, autenticação de usuários e um painel administrativo com múltiplos níveis de acesso (cliente, funcionário e gerente).

O projeto foi construído com TypeScript tanto no frontend quanto no backend, seguindo uma arquitetura de API RESTful para a realização de um trabalho de ciências da computação, dirigida pelo professor eduardo popovici na matéria "Typescript".

Realizado por:
  - Eduardo Fernando de Almeida Loschi
  - João Vitor Quirino Ramos

## ✨ Funcionalidades Principais

### Para Clientes
- **Cadastro e Login:** Sistema de autenticação seguro.
- **Cardápio Dinâmico:** Visualização de todos os itens disponíveis com imagens, descrições e preços.
- **Carrinho de Compras:** Adição de múltiplos itens e ajuste de quantidades.
- **Sistema de Pedidos:** Finalização de compra com seleção de método de pagamento.
- **Histórico de Pedidos:** Visualização de todos os pedidos anteriores com status e recibos detalhados.

### Para Funcionários
- **Painel de Controle:** Acesso a uma área restrita após o login.
- **Gerenciamento de Pedidos:** Visualização de todos os pedidos ativos ("Na Fila", "Sendo Preparado").
- **Atualização de Status:** Capacidade de alterar o status de um pedido em tempo real.

### Para Gerentes
- **Acesso Total de Funcionário:** Inclui todas as permissões de um funcionário.
- **Gerenciamento do Cardápio:**
    - Cadastrar novos itens com nome, descrição, preço e imagem.
    - Editar informações de itens existentes.
- **Gerenciamento de Usuários:** Promover contas de clientes para o cargo de funcionário.
- **Visão Geral de Vendas:** Acesso a todos os recibos de pedidos já realizados.
- **Relatórios:** Painel com dados de vendas (itens vendidos hoje e no mês).

---

## 🛠️ Tecnologias e Ferramentas Utilizadas

### Backend
- **Node.js:** Ambiente de execução JavaScript no servidor.
- **TypeScript:** Linguagem principal para um código tipado e mais seguro.
- **Express.js:** Framework para a construção da API RESTful.
- **PostgreSQL:** Banco de dados relacional para armazenamento de todos os dados.
- **`node-postgres` (pg):** Driver para a comunicação entre o Node.js e o PostgreSQL.
- **JWT (JSON Web Tokens):** Para autenticação e autorização baseada em tokens.
- **Multer:** Middleware para o upload de imagens dos itens do cardápio.
- **CORS:** Para permitir a comunicação entre o frontend e o backend em portas diferentes.

### Frontend
- **HTML5 e CSS3:** Estrutura e estilização das páginas.
- **TypeScript:** Para adicionar interatividade e lógica à interface do usuário.
- **CSS Flexbox:** Utilizado para criar layouts responsivos e organizados.

### Ambiente de Desenvolvimento
- **Git & GitHub:** Para controle de versão do código.
- **VS Code:** Editor de código.
- **Live Server (Extensão VS Code):** Para servir os arquivos do frontend localmente.
- **pgAdmin 4 / DBeaver:** Para gerenciamento visual do banco de dados PostgreSQL.
- **(Opcional) Docker:** Para rodar o banco de dados PostgreSQL em um ambiente containerizado e isolado.

---

## 🚀 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e executar a aplicação no seu ambiente de desenvolvimento.

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [PostgreSQL](https://www.postgresql.org/download/) (ou [Docker](https://www.docker.com/products/docker-desktop/))
- Git

### 1. Clonar o Repositório
Abra seu terminal e clone o projeto do GitHub:
```bash
git clone https://github.com/seu-usuario/nome-do-repositorio.git
cd nome-do-repositorio
```

### 2. Configurar o Backend
Primeiro, vamos configurar o servidor.

```bash
# Navegue até a pasta do backend
cd backend

# Instale todas as dependências listadas no package.json
npm install

# (Importante) Configure o Banco de Dados
# 1. Crie um banco de dados no PostgreSQL (ex: 'pizzaria_db').
# 2. Abra o arquivo `src/config/database.ts` e ajuste as credenciais
#    (user, host, database, password, port) para corresponder à sua configuração.

# Compile o código TypeScript para JavaScript
tsc

# Inicie o servidor do backend
node dist/server.js
```
O seu servidor da API estará rodando em `http://localhost:3000`. Ele criará as tabelas do banco de dados automaticamente na primeira execução.

### 3. Configurar e Rodar o Frontend
Em um **novo terminal**, vamos configurar o cliente.

```bash
# Navegue até a pasta do frontend a partir da raiz do projeto
cd frontend

# Não há dependências NPM para instalar no frontend (por enquanto)

# Compile o código TypeScript para JavaScript
tsc

# Inicie o servidor de desenvolvimento
# Clique com o botão direito no arquivo `public/index.html` ou `public/Login.html`
# e selecione "Open with Live Server".
```
Seu navegador abrirá o site, geralmente em `http://localhost:5500`.

### 4. Populando o Banco (Opcional)
Para ter dados de teste, você pode usar os comandos `INSERT INTO` fornecidos no projeto para adicionar usuários (cliente, funcionário, gerente) e itens ao cardápio diretamente no seu cliente de banco de dados.

---

## 🏗️ Estrutura do Projeto

O projeto é dividido em duas pastas principais: `frontend` e `backend`, cada uma com suas próprias responsabilidades.

```
/
├── backend/
│   ├── src/
│   │   ├── config/       # Conexão com o BD
│   │   ├── services/     # Lógica de negócio (interação com o BD)
│   │   └── server.ts     # Definição das rotas da API (Express)
│   └── tsconfig.json
│
└── frontend/
    ├── public/           # Arquivos estáticos servidos ao navegador (HTML, CSS)
    ├── ts/               # Código-fonte TypeScript do frontend
    └── tsconfig.json
```

---

