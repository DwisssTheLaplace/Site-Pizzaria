"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepararAmbiente = prepararAmbiente;
exports.inserirCadastro = inserirCadastro;
exports.login = login;
exports.inserirItemCardapio = inserirItemCardapio;
exports.buscarItensCardapio = buscarItensCardapio;
exports.criarPedido = criarPedido;
exports.promoverParaFuncionario = promoverParaFuncionario;
exports.buscarPedidosPorCliente = buscarPedidosPorCliente;
exports.buscarPedidosAtivos = buscarPedidosAtivos;
exports.atualizarStatusPedido = atualizarStatusPedido;
exports.buscarDetalhesDoPedido = buscarDetalhesDoPedido;
exports.buscarItemCardapioPorId = buscarItemCardapioPorId;
exports.atualizarItemCardapio = atualizarItemCardapio;
exports.buscarTodosOsPedidos = buscarTodosOsPedidos;
exports.buscarDetalhesDoPedidoComoGerente = buscarDetalhesDoPedidoComoGerente;
exports.gerarRelatorioVendas = gerarRelatorioVendas;
const { Pool } = require('pg');
const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};
const pool = new Pool(dbConfig);
function prepararAmbiente() {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield pool.connect();
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            cargo VARCHAR(50) NOT NULL
            ); `;
            yield client.query(createTableQuery);
            console.log('Tabela "usuarios" está pronta.'); // remover para adicionar no site ao inves daq
            const createCardapioTableQuery = `
            CREATE TABLE IF NOT EXISTS cardapio_itens (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                imagem_url VARCHAR(255) NOT NULL
            );
        `;
            yield client.query(createCardapioTableQuery);
            console.log('Tabela "cardapio_itens" está pronta.');
            const createPedidosTableQuery = `
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL,
                valor_total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Sendo Preparado',
                metodo_pagamento VARCHAR(50) NOT NULL,
                troco_para DECIMAL(10, 2), -- Pode ser nulo se não precisar de troco
                data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
            );
        `;
            yield client.query(createPedidosTableQuery);
            console.log('Tabela "pedidos" está pronta.');
            // Nova tabela para os itens de cada pedido
            const createPedidoItensTableQuery = `
            CREATE TABLE IF NOT EXISTS pedido_itens (
                id SERIAL PRIMARY KEY,
                pedido_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL,
                quantidade INTEGER NOT NULL,
                preco_unitario DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
                FOREIGN KEY (item_id) REFERENCES cardapio_itens(id)
            );
        `;
            yield client.query(createPedidoItensTableQuery);
            console.log('Tabela "pedido_itens" está pronta.');
        }
        catch (err) {
            console.error('Erro ao preparar o ambiente:', err); // remover para adicionar no site ao inves daq
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
function inserirCadastro(nome, email, senha, cargo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield pool.connect();
            const insertQuery = `
            INSERT INTO usuarios (nome, email, senha, cargo)
            VALUES ($1, $2, $3, $4)
            RETURNING id; `;
            const res = yield client.query(insertQuery, [nome, email, senha, cargo]);
            console.log('Cadastro inserido com ID:', res.rows[0].id); // remover para adicionar no site ao inves daq
            client.release();
        }
        catch (err) {
            console.error('Erro ao inserir cadastro:', err); // remover para adicionar no site ao inves daq
        }
    });
}
function login(email, senha) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield pool.connect();
            const selectQuery = `
            SELECT * FROM usuarios WHERE email = $1 AND senha = $2; `;
            const res = yield client.query(selectQuery, [email, senha]);
            if (res.rows.length > 0) {
                const usuario = res.rows[0];
                if (usuario.senha === senha) {
                    console.log('Login bem-sucedido para: ', usuario.nome);
                    return usuario;
                }
            }
            console.log('Falha no login para o email: ', email);
            return null;
        }
        catch (err) {
            console.error('Erro durante o login:', err);
            throw err;
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
function inserirItemCardapio(nome, descricao, preco, imagem_url) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield pool.connect();
            const insertQuery = `
            INSERT INTO cardapio_itens (nome, descricao, preco, imagem_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id; 
        `;
            const res = yield client.query(insertQuery, [nome, descricao, preco, imagem_url]);
            console.log('Item do cardápio inserido com ID:', res.rows[0].id);
            return res.rows[0].id;
        }
        catch (err) {
            console.error('Erro ao inserir item do cardápio:', err);
            throw err;
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
function buscarItensCardapio() {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield pool.connect();
            const selectQuery = `SELECT * FROM cardapio_itens;`;
            const res = yield client.query(selectQuery);
            return res.rows;
        }
        catch (err) {
            console.error('Erro ao buscar itens do cardápio:', err);
            throw err;
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
function criarPedido(clienteId, itens, valorTotal, metodoPagamento, trocoPara) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield pool.connect();
            yield client.query('BEGIN');
            const insertPedidoQuery = `
            INSERT INTO pedidos (cliente_id, valor_total, metodo_pagamento, troco_para)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;
            const resPedido = yield client.query(insertPedidoQuery, [clienteId, valorTotal, metodoPagamento, trocoPara]);
            const novoPedidoId = resPedido.rows[0].id;
            const insertItemQuery = `
            INSERT INTO pedido_itens (pedido_id, item_id, quantidade, preco_unitario)
            VALUES ($1, $2, $3, $4);
        `;
            for (const item of itens) {
                yield client.query(insertItemQuery, [novoPedidoId, item.id, item.quantidade, item.preco]);
            }
            yield client.query('COMMIT');
            console.log(`Pedido ${novoPedidoId} criado com sucesso para o cliente ${clienteId}.`);
            return novoPedidoId;
        }
        catch (err) {
            if (client) {
                yield client.query('ROLLBACK');
            }
            console.error('Erro ao criar pedido:', err);
            throw err;
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
function promoverParaFuncionario(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `UPDATE usuarios SET cargo = 'funcionario' WHERE email = $1 RETURNING id, nome, email, cargo;`;
            const res = yield client.query(query, [email]);
            return res.rows.length > 0 ? res.rows[0] : null;
        }
        finally {
            client.release();
        }
    });
}
function buscarPedidosPorCliente(clienteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `
        SELECT id, valor_total, status, metodo_pagamento, data_pedido 
        FROM pedidos 
        WHERE cliente_id = $1 
        ORDER BY data_pedido DESC;`;
            const res = yield client.query(query, [clienteId]);
            return res.rows;
        }
        finally {
            client.release();
        }
    });
}
function buscarPedidosAtivos() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `SELECT * FROM pedidos WHERE status NOT IN ('Concluído', 'Entregue') ORDER BY data_pedido ASC;`;
            const res = yield client.query(query);
            return res.rows;
        }
        finally {
            client.release();
        }
    });
}
function atualizarStatusPedido(pedidoId, novoStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *;`;
            const res = yield client.query(query, [novoStatus, pedidoId]);
            return res.rows[0];
        }
        finally {
            client.release();
        }
    });
}
function buscarDetalhesDoPedido(pedidoId, clienteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `
            SELECT
                p.id as pedido_id,
                p.data_pedido,
                p.status,
                p.valor_total,
                p.metodo_pagamento,
                p.troco_para,
                pi.quantidade,
                pi.preco_unitario,
                ci.nome as item_nome
            FROM pedidos p
            JOIN pedido_itens pi ON p.id = pi.pedido_id
            JOIN cardapio_itens ci ON pi.item_id = ci.id
            WHERE p.id = $1 AND p.cliente_id = $2;
        `;
            const res = yield client.query(query, [pedidoId, clienteId]);
            const rows = res.rows;
            if (rows.length === 0) {
                return null;
            }
            const detalhesDoPedido = {
                id: rows[0].pedido_id,
                data_pedido: rows[0].data_pedido,
                status: rows[0].status,
                valor_total: rows[0].valor_total,
                metodo_pagamento: rows[0].metodo_pagamento,
                troco_para: rows[0].troco_para,
                itens: rows.map(row => ({
                    nome: row.item_nome,
                    quantidade: row.quantidade,
                    preco_unitario: row.preco_unitario
                }))
            };
            return detalhesDoPedido;
        }
        finally {
            client.release();
        }
    });
}
function buscarItemCardapioPorId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `SELECT * FROM cardapio_itens WHERE id = $1;`;
            const res = yield client.query(query, [id]);
            return res.rows[0];
        }
        finally {
            client.release();
        }
    });
}
function atualizarItemCardapio(id, nome, descricao, preco) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `
            UPDATE cardapio_itens 
            SET nome = $1, descricao = $2, preco = $3 
            WHERE id = $4 
            RETURNING *;
        `;
            const res = yield client.query(query, [nome, descricao, preco, id]);
            return res.rows[0];
        }
        finally {
            client.release();
        }
    });
}
function buscarTodosOsPedidos() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `SELECT * FROM pedidos ORDER BY data_pedido DESC;`;
            const res = yield client.query(query);
            return res.rows;
        }
        finally {
            client.release();
        }
    });
}
function buscarDetalhesDoPedidoComoGerente(pedidoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const query = `
            SELECT
                p.id as pedido_id,
                p.data_pedido,
                p.status,
                p.valor_total,
                p.metodo_pagamento,
                p.troco_para,
                p.cliente_id, -- Adicionamos o ID do cliente para o gerente saber quem fez o pedido
                pi.quantidade,
                pi.preco_unitario,
                ci.nome as item_nome
            FROM pedidos p
            JOIN pedido_itens pi ON p.id = pi.pedido_id
            JOIN cardapio_itens ci ON pi.item_id = ci.id
            WHERE p.id = $1; -- A cláusula WHERE para cliente_id foi removida
        `;
            const res = yield client.query(query, [pedidoId]);
            const rows = res.rows;
            if (rows.length === 0) {
                return null;
            }
            const detalhesDoPedido = {
                id: rows[0].pedido_id,
                cliente_id: rows[0].cliente_id,
                data_pedido: rows[0].data_pedido,
                status: rows[0].status,
                valor_total: rows[0].valor_total,
                metodo_pagamento: rows[0].metodo_pagamento,
                troco_para: rows[0].troco_para,
                itens: rows.map(row => ({
                    nome: row.item_nome,
                    quantidade: row.quantidade,
                    preco_unitario: row.preco_unitario
                }))
            };
            return detalhesDoPedido;
        }
        finally {
            client.release();
        }
    });
}
function gerarRelatorioVendas() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const queryHoje = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('day', NOW());
        `;
            const resHoje = yield client.query(queryHoje);
            const vendidosHoje = resHoje.rows[0].total;
            const queryMes = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('month', NOW());
        `;
            const resMes = yield client.query(queryMes);
            const vendidosMes = resMes.rows[0].total;
            return { vendidosHoje, vendidosMes };
        }
        finally {
            client.release();
        }
    });
}
