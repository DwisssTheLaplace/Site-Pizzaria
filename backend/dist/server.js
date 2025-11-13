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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = require("./Admin");
const app = (0, express_1.default)();
const PORT = 3000; // porta
const JWT_Senha = '2,x$0jJ]Ot]r!:#{@lCh#?FOMFF]PhQ2kfnD5!ZA_pASaPe>[';
app.use((0, cors_1.default)());
app.use(express_1.default.json()); //middleware -> entender json das requisições
app.post('/cadastrar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, senha, cargo } = req.body;
    if (!nome || !email || !senha || !cargo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    try {
        yield (0, Admin_1.inserirCadastro)(nome, email, senha, cargo);
        res.status(201).json({ message: 'Cadastro realizado com sucesso.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar o cadastro. Tente novamente' });
    }
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    try {
        const usuario = yield (0, Admin_1.login)(email, senha);
        if (usuario) {
            const token = jsonwebtoken_1.default.sign({ id: usuario.id, nome: usuario.nome, cargo: usuario.cargo }, JWT_Senha, { expiresIn: '56h' });
            res.status(200).json({ message: 'Login realizado com sucesso.' });
        }
        else {
            res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar o login. Tente novamente.' });
    }
}));
function verificarTotem(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // formato "bearer TOKEN"
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }
    jsonwebtoken_1.default.verify(token, JWT_Senha, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
        req.user = user;
        next();
    });
}
app.get('/user-perfil', verificarTotem, (req, res) => {
    res.json({
        message: `Bem-vindo ao seu perfil, ${req.user.nome}!`,
        cargo: req.user.cargo
    });
});
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, Admin_1.prepararAmbiente)();
    console.log(`Servidor rodando na porta ${PORT}`);
}));
