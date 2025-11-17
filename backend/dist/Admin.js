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
