interface PedidoAtivo {
    id: number;
    cliente_id: number;
    valor_total: string;
    status: string;
    data_pedido: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const inicializar = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'Login.html';
            return;
        }

        const container = document.getElementById('pedidos-ativos-container');
        if (!container) return;

        try {
            const response = await fetch('http://localhost:3000/pedidos/ativos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao carregar pedidos.');
            
            const pedidos: PedidoAtivo[] = await response.json();
            renderizarPedidos(pedidos, container);

        } catch (error) {
            container.innerHTML = `<p style="color: red;">Não foi possível carregar os pedidos.</p>`;
        }

        adicionarBotaoVoltar(token);
    };

    document.getElementById('pedidos-ativos-container')?.addEventListener('change', async (event) => {
        const target = event.target as HTMLSelectElement;
        if (target && target.tagName === 'SELECT' && target.dataset.id) {
            const pedidoId = target.dataset.id;
            const novoStatus = target.value;
            await atualizarStatusDoPedido(pedidoId, novoStatus);
        }
    });

    inicializar();
});

function renderizarPedidos(pedidos: PedidoAtivo[], container: HTMLElement) {
    container.innerHTML = '';
    if (pedidos.length === 0) {
        container.innerHTML = '<p>Nenhum pedido ativo no momento.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const pedidoElement = document.createElement('div');
        pedidoElement.className = 'pedido-gerencia';
        const dataFormatada = new Date(pedido.data_pedido).toLocaleString('pt-BR');
        
        pedidoElement.innerHTML = `
            <h3>Pedido #${pedido.id}</h3>
            <p><strong>Cliente ID:</strong> ${pedido.cliente_id}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Valor:</strong> R$ ${parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}</p>
            <label for="status-${pedido.id}"><strong>Alterar Status:</strong></label>
            <select id="status-${pedido.id}" data-id="${pedido.id}">
                <option value="Na Fila" ${pedido.status === 'Na Fila' ? 'selected' : ''}>Na Fila</option>
                <option value="Sendo Preparado" ${pedido.status === 'Sendo Preparado' ? 'selected' : ''}>Sendo Preparado</option>
                <option value="Sendo Entregue" ${pedido.status === 'Sendo Entregue' ? 'selected' : ''}>Sendo Entregue</option>
                <option value="Concluído" ${pedido.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
            </select>
        `;
        container.appendChild(pedidoElement);
    });
}

async function atualizarStatusDoPedido(pedidoId: string, novoStatus: string) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`http://localhost:3000/pedidos/${pedidoId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ novoStatus })
        });

        if (!response.ok) throw new Error('Falha ao atualizar status.');

        alert(`Status do Pedido #${pedidoId} atualizado para "${novoStatus}"!`);
    } catch (error) {
        alert(`Erro ao atualizar o status do pedido.`);
    }
}

function adicionarBotaoVoltar(token: string) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const cargo = payload.cargo;
        const container = document.getElementById('botao-voltar-container');
        if (!container) return;

        let urlVoltar = 'index.html';
        if (cargo === 'funcionario') urlVoltar = 'menuFuncionario.html';
        if (cargo === 'gerente') urlVoltar = '../gerente/menuGerente.html';

        container.innerHTML = `<a href="${urlVoltar}"><button class="Enviar" style="background-color: #555;">Voltar ao Menu</button></a>`;
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
    }
}