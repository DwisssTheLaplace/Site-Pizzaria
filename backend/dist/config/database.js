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
exports.pool = void 0;
exports.prepararAmbiente = prepararAmbiente;
const { Pool } = require('pg');
const dbConfig = {
    user: 'aluno',
    host: 'localhost',
    database: 'db_profedu',
    password: '102030',
    port: 5432,
};
exports.pool = new Pool(dbConfig);
function prepararAmbiente() {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield exports.pool.connect();
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            cargo VARCHAR(50) NOT NULL
            ); `;
            yield client.query(createTableQuery);
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
            console.error('Erro ao preparar o ambiente:', err);
        }
        finally {
            if (client) {
                client.release();
            }
        }
    });
}
