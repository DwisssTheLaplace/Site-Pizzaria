document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'Login.html'; return; }

    const container = document.getElementById('todos-recibos-container');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/pedidos/todos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pedidos = await response.json();
        
        container.innerHTML = '';
        if (pedidos.length === 0) {
            container.innerHTML = '<p>Nenhum pedido foi realizado ainda.</p>';
            return;
        }

        pedidos.forEach((pedido: any) => {
            const pedidoElement = document.createElement('div');
            pedidoElement.className = 'pedido-recibo';
            const dataFormatada = new Date(pedido.data_pedido).toLocaleString('pt-BR');
            const precoFormatado = parseFloat(pedido.valor_total).toFixed(2).replace('.', ',');

            pedidoElement.innerHTML = `
                <h3>Pedido #${pedido.id} (Cliente ID: ${pedido.cliente_id})</h3>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> ${pedido.status}</p>
                <p><strong>Valor Total:</strong> R$ ${precoFormatado}</p>
                <br>
                <a href="./reciboGerente.html?id=${pedido.id}" style="font-weight: bold; color: #007bff;">Ver Recibo Detalhado</a>
            `;
            container.appendChild(pedidoElement);
        });
    } catch (error) {
        container.innerHTML = `<p style="color: red;">Não foi possível carregar os recibos.</p>`;
    }
});