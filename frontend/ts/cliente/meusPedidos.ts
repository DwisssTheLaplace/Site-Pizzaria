interface Pedido {
    id: number;
    data_pedido: string;
    status: string;
    valor_total: string;
}

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça o login.');
        window.location.href = 'Login.html';
        return; 
    }

    const container = document.getElementById('pedidos-container');
    if (!container) {
        console.error("Container de pedidos não encontrado!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/meus-pedidos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                alert('Sua sessão expirou. Por favor, faça login novamente.');
                localStorage.removeItem('authToken'); 
                window.location.href = 'Login.html';
            }
            throw new Error('Falha ao carregar os pedidos.');
        }

        const pedidos: Pedido[] = await response.json();

        renderizarPedidos(pedidos, container);

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        container.innerHTML = `<p style="color: red;">Não foi possível carregar seus pedidos. Tente novamente mais tarde.</p>`;
    }
});

function renderizarPedidos(pedidos: Pedido[], container: HTMLElement) {
    container.innerHTML = '';

    if (pedidos.length === 0) {
        container.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const pedidoElement = document.createElement('div');
        pedidoElement.className = 'pedido-recibo';

        const dataFormatada = new Date(pedido.data_pedido).toLocaleString('pt-BR');

        const precoFormatado = parseFloat(pedido.valor_total).toFixed(2).replace('.', ',');

        pedidoElement.innerHTML = `
            <h3>Pedido #${pedido.id}</h3>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Status:</strong> <span class="status">${pedido.status}</span></p>
            <p><strong>Valor Total:</strong> R$ ${precoFormatado}</p>
            <br> 
            <a href="./recibo.html?id=${pedido.id}" style="font-weight: bold; color: #007bff;">Ver Recibo Detalhado</a>
        `;

        container.appendChild(pedidoElement);
    });
}