"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça login.');
        window.location.href = 'Login.html';
        return;
    }
    const itensCarrinhoContainer = document.getElementById('itens-carrinho');
    const valorTotalElement = document.getElementById('valor-total');
    const metodoPagamentoSelect = document.getElementById('metodo-pagamento');
    const campoTrocoDiv = document.getElementById('campo-troco');
    const checkoutForm = document.getElementById('checkout-form');
    const mensagemPedido = document.getElementById('mensagem-pedido');
    let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    let valorTotal = 0;
    function renderizarCarrinho() {
        itensCarrinhoContainer.innerHTML = '';
        valorTotal = 0;
        if (carrinho.length === 0) {
            itensCarrinhoContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            checkoutForm.style.display = 'none';
        }
        carrinho.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrinho';
            itemElement.innerHTML = `<p>${item.nome} - Quantidade: ${item.quantidade} - Preço: R$ ${(item.preco * item.quantidade).toFixed(2)}</p>`;
            itensCarrinhoContainer.appendChild(itemElement);
            valorTotal += item.preco * item.quantidade;
        });
        valorTotalElement.textContent = `Total: R$ ${valorTotal.toFixed(2)}`;
    }
    metodoPagamentoSelect.addEventListener('change', () => {
        if (metodoPagamentoSelect.value === 'dinheiro') {
            campoTrocoDiv.style.display = 'block';
        }
        else {
            campoTrocoDiv.style.display = 'none';
        }
    });
    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const metodoPagamento = metodoPagamentoSelect.value;
        const trocoInput = document.getElementById('troco');
        const trocoPara = metodoPagamento === 'dinheiro' && trocoInput.value ? parseFloat(trocoInput.value) : undefined;
        const dadosPedido = {
            itens: carrinho.map(item => ({ id: item.id, quantidade: item.quantidade, preco: item.preco })),
            valorTotal: valorTotal,
            metodoPagamento: metodoPagamento,
            trocoPara: trocoPara
        };
        try {
            const response = await fetch('http://localhost:3000/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Correção: Adicionar espaço depois de 'Bearer'
                },
                body: JSON.stringify(dadosPedido)
            });
            const result = await response.json();
            if (response.ok) {
                mensagemPedido.textContent = 'Pedido realizado com sucesso! ID do Pedido: ' + result.pedidoId;
                mensagemPedido.style.color = 'green';
                // Limpar o carrinho e a interface
                localStorage.removeItem('carrinho');
                carrinho = [];
                renderizarCarrinho();
            }
            else {
                mensagemPedido.textContent = `Erro: ${result.error}`;
                mensagemPedido.style.color = 'red';
            }
        }
        catch (error) {
            mensagemPedido.textContent = 'Erro de conexão com o servidor.';
            mensagemPedido.style.color = 'red';
        }
    });
    renderizarCarrinho();
});
