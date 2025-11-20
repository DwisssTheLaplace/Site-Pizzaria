import { pool } from '../config/database';

interface itemCarrinho {
    id: number;
    quantidade: number;
    preco: number;
}

export async function criarPedido(clienteId: number, itens: itemCarrinho[], valorTotal: number, metodoPagamento: string, trocoPara?: number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const insertPedidoQuery = `
            INSERT INTO pedidos (cliente_id, valor_total, metodo_pagamento, troco_para)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;
        const resPedido = await client.query(insertPedidoQuery, [clienteId, valorTotal, metodoPagamento, trocoPara]);
        const novoPedidoId = resPedido.rows[0].id;

        const insertItemQuery = `
            INSERT INTO pedido_itens (pedido_id, item_id, quantidade, preco_unitario)
            VALUES ($1, $2, $3, $4);
        `;
        for (const item of itens) { 
            await client.query(insertItemQuery, [novoPedidoId, item.id, item.quantidade, item.preco]);
        }

        await client.query('COMMIT');

        console.log(`Pedido ${novoPedidoId} criado com sucesso para o cliente ${clienteId}.`);
        return novoPedidoId;

    } catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Erro ao criar pedido:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}




export async function buscarPedidosPorCliente(clienteId: number) {
    const client = await pool.connect();
    try {
        const query = `
        SELECT id, valor_total, status, metodo_pagamento, data_pedido 
        FROM pedidos 
        WHERE cliente_id = $1 
        ORDER BY data_pedido DESC;`;
        const res = await client.query(query, [clienteId]);
        return res.rows;
    } finally {
        client.release();
    }
}

export async function buscarPedidosAtivos() {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM pedidos WHERE status NOT IN ('Concluído', 'Entregue') ORDER BY data_pedido ASC;`;
        const res = await client.query(query);
        return res.rows;
    } finally {
        client.release();
    }
}

export async function atualizarStatusPedido(pedidoId: number, novoStatus: string) {
    const client = await pool.connect();
    try {
        const query = `UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *;`;
        const res = await client.query(query, [novoStatus, pedidoId]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

interface DetalhePedidoRow {
    pedido_id: number;
    data_pedido: string;
    status: string;
    valor_total: string;
    metodo_pagamento: string;
    troco_para: string | null;
    quantidade: number;
    preco_unitario: string;
    item_nome: string;
}

export async function buscarDetalhesDoPedido(pedidoId: number, clienteId: number) {
    const client = await pool.connect();
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

        const res = await client.query(query, [pedidoId, clienteId]);

        const rows = res.rows as DetalhePedidoRow[];

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
    } finally {
        client.release();
    }
}

export async function buscarDetalhesDoPedidoComoGerente(pedidoId: number) {
    const client = await pool.connect();
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
        const res = await client.query(query, [pedidoId]);

        const rows = res.rows as (DetalhePedidoRow & { cliente_id: number })[];

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
    } finally {
        client.release();
    }
}

export async function buscarTodosOsPedidos() {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM pedidos ORDER BY data_pedido DESC;`;
        const res = await client.query(query);
        return res.rows;
    } finally {
        client.release();
    }
}