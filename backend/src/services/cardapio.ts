import { pool } from '../config/database';

export async function inserirItemCardapio(nome: string, descricao: string, preco: number, imagem_url: string) {
    let client;
    try {
        client = await pool.connect();
        const insertQuery = `
            INSERT INTO cardapio_itens (nome, descricao, preco, imagem_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id; 
        `;
        const res = await client.query(insertQuery, [nome, descricao, preco, imagem_url]);
        console.log('Item do cardápio inserido com ID:', res.rows[0].id);
        return res.rows[0].id;
    } catch (err) {
        console.error('Erro ao inserir item do cardápio:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function buscarItensCardapio() {
    let client;
    try {
        client = await pool.connect();
        const selectQuery = `SELECT * FROM cardapio_itens;`;
        const res = await client.query(selectQuery);
        return res.rows;
    } catch (err) {
        console.error('Erro ao buscar itens do cardápio:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function buscarItemCardapioPorId(id: number) {
    const client = await pool.connect();
    try {
        const query = `SELECT * FROM cardapio_itens WHERE id = $1;`;
        const res = await client.query(query, [id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function atualizarItemCardapio(id: number, nome: string, descricao: string, preco: number) {
    const client = await pool.connect();
    try {
        const query = `
            UPDATE cardapio_itens 
            SET nome = $1, descricao = $2, preco = $3 
            WHERE id = $4 
            RETURNING *;
        `;
        const res = await client.query(query, [nome, descricao, preco, id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}



