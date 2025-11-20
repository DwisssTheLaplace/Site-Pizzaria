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
exports.criarPedido = criarPedido;
exports.buscarPedidosPorCliente = buscarPedidosPorCliente;
exports.buscarPedidosAtivos = buscarPedidosAtivos;
exports.atualizarStatusPedido = atualizarStatusPedido;
exports.buscarDetalhesDoPedido = buscarDetalhesDoPedido;
exports.buscarDetalhesDoPedidoComoGerente = buscarDetalhesDoPedidoComoGerente;
exports.buscarTodosOsPedidos = buscarTodosOsPedidos;
const database_1 = require("../config/database");
function criarPedido(clienteId, itens, valorTotal, metodoPagamento, trocoPara) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield database_1.pool.connect();
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
function buscarPedidosPorCliente(clienteId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
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
        const client = yield database_1.pool.connect();
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
        const client = yield database_1.pool.connect();
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
        const client = yield database_1.pool.connect();
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
function buscarDetalhesDoPedidoComoGerente(pedidoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
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
function buscarTodosOsPedidos() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
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
