import { pool } from '../config/database';

export async function gerarRelatorioVendas() {
    const client = await pool.connect();
    try {
        const queryHoje = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('day', NOW());
        `;
        const resHoje = await client.query(queryHoje);
        const vendidosHoje = resHoje.rows[0].total;

        const queryMes = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('month', NOW());
        `;
        const resMes = await client.query(queryMes);
        const vendidosMes = resMes.rows[0].total;
        
        return { vendidosHoje, vendidosMes };

    } finally {
        client.release();
    }
}