import { pool } from '../config/database';

export async function inserirCadastro(nome: string, email: string, senha: string, cargo: string) {
    try {
        const client = await pool.connect();
        const insertQuery = `
            INSERT INTO usuarios (nome, email, senha, cargo)
            VALUES ($1, $2, $3, $4)
            RETURNING id; `
        const res = await client.query(insertQuery, [nome, email, senha, cargo]);
        console.log('Cadastro inserido com ID:', res.rows[0].id);
        client.release();
    } catch (err) {
        console.error('Erro ao inserir cadastro:', err);
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

export async function promoverParaFuncionario(email: string) {
    const client = await pool.connect();
    try {
        const query = `UPDATE usuarios SET cargo = 'funcionario' WHERE email = $1 RETURNING id, nome, email, cargo;`;
        const res = await client.query(query, [email]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } finally {
        client.release();
    }
}