document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'Login.html'; return; }

    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('id');

    const container = document.getElementById('recibo-container');
    if (!container) return;
    if (!pedidoId) {
        container.innerHTML = `<p style="color: red;">ID do pedido não encontrado.</p>`;
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/pedidos/detalhes/${pedidoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Não foi possível carregar o recibo.');
        
        const recibo = await response.json();
        renderizarReciboGerente(recibo, container);

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Erro ao carregar os detalhes do pedido.</p>`;
    }
});

function renderizarReciboGerente(recibo: any, container: HTMLElement) {
    const dataFormatada = new Date(recibo.data_pedido).toLocaleString('pt-BR');
    const valorTotalFormatado = parseFloat(recibo.valor_total).toFixed(2).replace('.', ',');

    let itensHtml = '';
    recibo.itens.forEach((item: any) => {
        const precoUnitario = parseFloat(item.preco_unitario).toFixed(2).replace('.', ',');
        const subtotal = (item.quantidade * item.preco_unitario).toFixed(2).replace('.', ',');
        itensHtml += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${precoUnitario}</td>
                <td>R$ ${subtotal}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="recibo-detalhado">
            <h2>Recibo do Pedido #${recibo.id}</h2>
            <p><strong>Cliente ID:</strong> ${recibo.cliente_id}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Status:</strong> ${recibo.status}</p>
            
            <table>
                <thead>
                    <tr><th>Item</th><th>Qtd.</th><th>Preço Unit.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>${itensHtml}</tbody>
            </table>

            <div class="total-info">
                <h3><strong>Valor Total: R$ ${valorTotalFormatado}</strong></h3>
                <p><strong>Pagamento:</strong> ${recibo.metodo_pagamento}</p>
                ${recibo.troco_para ? `<p><strong>Troco para:</strong> R$ ${parseFloat(recibo.troco_para).toFixed(2).replace('.', ',')}</p>` : ''}
            </div>
            <br>
            <a href="todosRecibos.html"><button class="Enviar" style="background-color: #555;">Voltar para Todos os Recibos</button></a>
        </div>
    `;
}