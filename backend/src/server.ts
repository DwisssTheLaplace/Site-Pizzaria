import express, { Request, Response, NextFunction} from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

import { prepararAmbiente } from './config/database';
import { inserirCadastro, login, promoverParaFuncionario } from './services/usuario';
import { inserirItemCardapio, buscarItensCardapio, buscarItemCardapioPorId, atualizarItemCardapio } from './services/cardapio';
import { criarPedido, buscarPedidosPorCliente, buscarPedidosAtivos, atualizarStatusPedido, buscarDetalhesDoPedido, buscarDetalhesDoPedidoComoGerente, buscarTodosOsPedidos } from './services/pedido';
import { gerarRelatorioVendas } from './services/relatorio';

// Configuração inicial do servidor
const app = express();
const PORT = 3000;
const JWT_Senha = '2,x$0jJ]Ot]r!:#{@lCh#?FOMFF]PhQ2kfnD5!ZA_pASaPe>[';

//  Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Tipagem global para o request do express
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Configuração do Multer (upload das imagens para o cardápio)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middlewares de autentificação e autorização

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

function verificarCargo(cargosPermitidos: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const cargoDoUsuario = req.user?.cargo;

        if (cargoDoUsuario && cargosPermitidos.includes(cargoDoUsuario)) {
            next(); // O usuário tem um dos cargos permitidos, pode prosseguir.
        } else {
            res.status(403).json({error: 'Acesso negado. Você não tem permissão para realizar esta ação.'});
        }
    };
}

// Rotas (endpoints da API): 

const cargosOperacionais = ['funcionario', 'gerente'];

// Rotas públicas e de usuários

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
            res.status(200).json({ 
                message: 'Login realizado com sucesso.',
                token: token,
                cargo: usuario.cargo });
        } else {
            res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar o login. Tente novamente.' });
    }
});



app.get('/user-perfil', verificarTotem, (req: Request, res: Response) => {
    res.json({
        message: `Bem-vindo ao seu perfil, ${req.user.nome}!`,
        cargo: req.user.cargo
    });
});

app.post('/cardapio/item', upload.single('imagem'), async (req: Request, res: Response) => {
    try {
        const { nome, descricao, preco } = req.body;
        const imagem = req.file;

        if (!nome || !descricao || !preco || !imagem) {
            return res.status(400).json({ error: 'Nome, preço e imagem são obrigatórios.' });
        }

        const imagemUrl = `http://localhost:${PORT}/${imagem.path}`;

        await inserirItemCardapio(nome, descricao, preco, imagemUrl);

        res.status(201).json({ message: 'Item cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar o item. Tente novamente.' });
}});

// Rotas de gerenciamento de usuários (Transformar uma conta registrada no cargo funcionario)

app.post('/cadastrar-funcionario', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({error: 'Todos os campos são obrigatórios.'});
    }
    try {
        await inserirCadastro(nome, email, senha, 'funcionario');
        res.status(201).json({ message: 'Funcionario cadastrado com sucesso!'});
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar funcionario.'});
    }
});


app.post('/usuarios/promover', verificarTotem, verificarCargo(['gerente']), async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }
    try {
        const usuarioPromovido = await promoverParaFuncionario(email);
        if (usuarioPromovido) {
            res.status(200).json({ message: `Usuário ${usuarioPromovido.nome} promovido para funcionário.` });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado com o e-mail fornecido.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao promover usuário.' });
    }
});

// Rotas para o cardápio (vizualização e gerenciamento)

app.get('/cardapio', async (req: Request, res: Response) => {
    try {
        const itens = await buscarItensCardapio();
        res.status(200).json(itens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar os itens do cardápio. Tente novamente.' });
    }
});

app.get('/cardapio/item/:id', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    try {
        const { id } = req.params;
        const item = await buscarItemCardapioPorId(Number(id));
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ error: 'Item não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar item.' });
    }
});

app.post('/cardapio/item', verificarTotem, verificarCargo(cargosOperacionais), upload.single('imagem'), async (req: Request, res: Response) => {
    try {
        const { nome, descricao, preco } = req.body;
        const imagem = req.file;

        if (!nome || !descricao || !preco || !imagem) {
            return res.status(400).json({ error: 'Nome, descrição, preço e imagem são obrigatórios.' });
        }
        
        const imagemUrl = `${req.protocol}://${req.get('host')}/${imagem.path}`;

        await inserirItemCardapio(nome, descricao, parseFloat(preco), imagemUrl);

        res.status(201).json({ message: 'Item cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar o item. Tente novamente.' });
    }
});

app.put('/cardapio/item/:id', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco } = req.body;

        if (!nome || !descricao || !preco) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        
        const itemAtualizado = await atualizarItemCardapio(Number(id), nome, descricao, parseFloat(preco));
        res.status(200).json({ message: 'Item atualizado com sucesso!', item: itemAtualizado });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o item.' });
    }
});

// Rotas de Pedidos

app.post('/pedidos', verificarTotem, async (req: Request, res: Response) => {
    try {
        const {itens, valorTotal, metodoPagamento, trocoPara} = req.body;
        const clienteId = req.user.id; // ID do usuário vem do token verificado

        if (!itens || !valorTotal || !metodoPagamento) {
            return res.status(400).json({ error: 'Itens, valor total e método de pagamento são obrigatórios.' });
        }

        const novoPedidoId = await criarPedido(clienteId, itens, valorTotal, metodoPagamento, trocoPara);

        res.status(201).json({ message: 'Pedido Realizado com sucesso!', pedidoId: novoPedidoId})
    }  catch (error) {
        console.error('Erro no endpoint /pedidos:', error);
        res.status(500).json({ error: 'Erro ao processar o pedido.' });
    }
});

app.get('/meus-pedidos', verificarTotem, verificarCargo(['cliente']), async (req, res) => {
    try {
        const clienteId = req.user.id;
        const pedidos = await buscarPedidosPorCliente(clienteId);
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({error: 'Erro ao buscar pedidos'});
    }
});

app.get('/pedidos/ativos', verificarTotem, verificarCargo(cargosOperacionais), async (req, res) => {
    try {
        const pedidos = await buscarPedidosAtivos();
        res.status(200).json(pedidos);
    } catch {
        res.status(500).json({error: 'ERRO ao buscar pedidos ativos.'});
    }
});

app.get('/pedidos/todos', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    try {
        const pedidos = await buscarTodosOsPedidos();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar todos os pedidos.' });
    }
});

app.get('/pedidos/detalhes/:id', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    try {
        const pedidoId = parseInt(req.params.id);
        if (isNaN(pedidoId)) {
            return res.status(400).json({ error: 'ID do pedido inválido.' });
        }

        const detalhes = await buscarDetalhesDoPedidoComoGerente(pedidoId);

        if (detalhes) {
            res.status(200).json(detalhes);
        } else {
            res.status(404).json({ error: 'Pedido não encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do pedido (gerente):', error);
        res.status(500).json({ error: 'Erro interno ao buscar detalhes do pedido.' });
    }
});

app.get('/pedidos/:id', verificarTotem, async (req: Request, res: Response) => {
    try {
        const pedidoId = parseInt(req.params.id);
        const clienteId = req.user.id;

        const detalhes = await buscarDetalhesDoPedido(pedidoId, clienteId);

        if (detalhes) {
            res.status(200).json(detalhes);
        } else {
            res.status(404).json({ error: 'Pedido não encontrado ou acesso negado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do pedido:', error);
        res.status(500).json({ error: 'Erro interno ao buscar detalhes do pedido.' });
    }
});

app.put('/pedidos/:id/status', verificarTotem, verificarCargo(cargosOperacionais), async (req, res) => {
    try {
        const { id } = req.params;
        const { novoStatus } = req.body;
        if (!novoStatus) {
            return res.status(400).json({error: 'O novo status é obrigatorio.'});
        }
        const pedidoAtualizado = await atualizarStatusPedido(Number(id), novoStatus);
        res.status(200).json(pedidoAtualizado);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o status do pedido.'});
    }
});

// Rota de relatório (relatório diario e mensal de vendas)

app.get('/relatorios/vendas', verificarTotem, verificarCargo(['gerente']), async (req, res) => {
    try {
        const relatorio = await gerarRelatorioVendas();
        res.status(200).json(relatorio);
    } catch (error) {
        console.error('Erro ao gerar relatório de vendas:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório.' });
    }
});

// Iniciador do servidor

app.listen(PORT, async () => {
    await prepararAmbiente();
    console.log(`Servidor rodando na porta ${PORT}`);
});