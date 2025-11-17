const { Pool } = require('pg'); 

const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};

const pool = new Pool(dbConfig);

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
        await client.query(createCardapioTableQuery);
        console.log('Tabela "cardapio_itens" está pronta.');

    } catch (err) {
        console.error('Erro ao preparar o ambiente:', err); // remover para adicionar no site ao inves daq
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function inserirCadastro(nome: string, email: string, senha: string, cargo: string) {
    try {
        const client = await pool.connect();
        const insertQuery = `
            INSERT INTO usuarios (nome, email, senha, cargo)
            VALUES ($1, $2, $3, $4)
            RETURNING id; `
        const res = await client.query(insertQuery, [nome, email, senha, cargo]);
        console.log('Cadastro inserido com ID:', res.rows[0].id); // remover para adicionar no site ao inves daq
        client.release();
    } catch (err) {
        console.error('Erro ao inserir cadastro:', err); // remover para adicionar no site ao inves daq
}}

export async function login(email: string, senha: string): Promise<any> {
    let client;
    try {
        client = await pool.connect();
        const selectQuery = `
            SELECT * FROM usuarios WHERE email = $1 AND senha = $2; `
        const res = await client.query(selectQuery, [email, senha]);
        
        if (res.rows.length > 0) {
            const usuario = res.rows[0];
            if (usuario.senha === senha) {
                console.log('Login bem-sucedido para: ', usuario.nome);
                return usuario;
            }  
        } 
        console.log('Falha no login para o email: ', email);
        return null;
    } catch (err) {
        console.error('Erro durante o login:', err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }

}

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