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
exports.inserirCadastro = inserirCadastro;
exports.login = login;
exports.promoverParaFuncionario = promoverParaFuncionario;
const database_1 = require("../config/database");
function inserirCadastro(nome, email, senha, cargo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield database_1.pool.connect();
            const insertQuery = `
            INSERT INTO usuarios (nome, email, senha, cargo)
            VALUES ($1, $2, $3, $4)
            RETURNING id; `;
            const res = yield client.query(insertQuery, [nome, email, senha, cargo]);
            console.log('Cadastro inserido com ID:', res.rows[0].id);
            client.release();
        }
        catch (err) {
            console.error('Erro ao inserir cadastro:', err);
        }
    });
}
function login(email, senha) {
    return __awaiter(this, void 0, void 0, function* () {
        let client;
        try {
            client = yield database_1.pool.connect();
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
function promoverParaFuncionario(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
        try {
            const query = `UPDATE usuarios SET cargo = 'funcionario' WHERE email = $1 RETURNING id, nome, email, cargo;`;
            const res = yield client.query(query, [email]);
            return res.rows.length > 0 ? res.rows[0] : null;
        }
        finally {
            client.release();
        }
    });
}
