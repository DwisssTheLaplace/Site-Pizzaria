const { Pool } = require('pg'); 

const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};

export const pool = new Pool(dbConfig);

export async function prepararAmbiente() {
    let client;
    try {
        client = await pool.connect();
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            cargo VARCHAR(50) NOT NULL
            ); `
        await client.query(createTableQuery);
        console.log('Tabela "usuarios" está pronta.'); 

        const createCardapioTableQuery = `
            CREATE TABLE IF NOT EXISTS cardapio_itens (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT,
                preco DECIMAL(10, 2) NOT NULL,
                imagem_url VARCHAR(255) NOT NULL
            );
        `;
        await client.query(createCardapioTableQuery);
        console.log('Tabela "cardapio_itens" está pronta.');

        const createPedidosTableQuery = `
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL,
                valor_total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Sendo Preparado',
                metodo_pagamento VARCHAR(50) NOT NULL,
                troco_para DECIMAL(10, 2),
                data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
            );
        `;
        await client.query(createPedidosTableQuery);
        console.log('Tabela "pedidos" está pronta.');

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
        await client.query(createPedidoItensTableQuery);
        console.log('Tabela "pedido_itens" está pronta.');

    } catch (err) {
        console.error('Erro ao preparar o ambiente:', err);
    } finally {
        if (client) {
            client.release();
        }
    }
}