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
exports.inserirItemCardapio = inserirItemCardapio;
exports.buscarItensCardapio = buscarItensCardapio;
exports.buscarItemCardapioPorId = buscarItemCardapioPorId;
exports.atualizarItemCardapio = atualizarItemCardapio;
const database_1 = require("../config/database");
function inserirItemCardapio(nome, descricao, preco, imagem_url) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield database_1.pool.connect();
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
            client = yield database_1.pool.connect();
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
function buscarItemCardapioPorId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
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
        const client = yield database_1.pool.connect();
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
