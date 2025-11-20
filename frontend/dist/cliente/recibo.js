"use strict";
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça o login.');
        window.location.href = 'Login.html';
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('id');
    const container = document.getElementById('recibo-container');
    if (!container) {
        console.error('Container do recibo não encontrado!');
        return;
    }
    if (!pedidoId) {
        container.innerHTML = `<p style="color: red;">ID do pedido não fornecido na URL.</p>`;
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/pedidos/${pedidoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Não foi possível carregar os detalhes do recibo.');
        }
        const recibo = await response.json();
        renderizarRecibo(recibo, container);
    }
    catch (error) {
        console.error('Erro ao buscar detalhes do recibo:', error);
        container.innerHTML = `<p style="color: red;">Erro ao carregar os detalhes do pedido. Tente novamente mais tarde.</p>`;
    }
});
function renderizarRecibo(recibo, container) {
    const dataFormatada = new Date(recibo.data_pedido).toLocaleString('pt-BR');
    const valorTotalFormatado = parseFloat(recibo.valor_total).toFixed(2).replace('.', ',');
    let itensHtml = '';
    recibo.itens.forEach((item) => {
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
            <p><strong>Data do Pedido:</strong> ${dataFormatada}</p>
            <p><strong>Status Atual:</strong> ${recibo.status}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itensHtml}
                </tbody>
            </table>

            <div class="total-info">
                <h3><strong>Valor Total: R$ ${valorTotalFormatado}</strong></h3>
                <p><strong>Forma de Pagamento:</strong> ${recibo.metodo_pagamento}</p>
                <!-- Exibe a informação de troco apenas se ela existir -->
                ${recibo.troco_para ? `<p><strong>Troco para:</strong> R$ ${parseFloat(recibo.troco_para).toFixed(2).replace('.', ',')}</p>` : ''}
            </div>

            <br>
            <a href="meusPedidos.html"><button class="Enviar" style="background-color: #555;">Voltar para Meus Pedidos</button></a>
        </div>
    `;
}
