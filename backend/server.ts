import express, { Request, Response, NextFunction} from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { inserirCadastro, prepararAmbiente, login } from './Admin';

const app = express();
const PORT = 3000; // porta
const JWT_Senha = '2,x$0jJ]Ot]r!:#{@lCh#?FOMFF]PhQ2kfnD5!ZA_pASaPe>[';
app.use(cors());
app.use(express.json()); //middleware -> entender json das requisições

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

app.post( '/cadastrar', async (req, res) => {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha || !cargo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    
    try {
        await inserirCadastro(nome, email, senha, cargo);
        res.status(201).json({ message: 'Cadastro realizado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar o cadastro. Tente novamente' });
    }
});

app.post( '/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const usuario = await login(email, senha);
        if (usuario) {
            const token = jwt.sign(
                { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo },
                JWT_Senha,
                { expiresIn: '56h' }
            );
            res.status(200).json({ message: 'Login realizado com sucesso.' });
        } else {
            res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar o login. Tente novamente.' });
    }
});

function verificarTotem(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // formato "bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_Senha, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
        req.user = user;
        next();
    });
}

app.get('/user-perfil', verificarTotem, (req: Request, res: Response) => {
    res.json({
        message: `Bem-vindo ao seu perfil, ${req.user.nome}!`,
        cargo: req.user.cargo
    });
});


app.listen(PORT, async () => {
    await prepararAmbiente();
    console.log(`Servidor rodando na porta ${PORT}`);
});
