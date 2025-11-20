const menuContainer = document.getElementById('menu-container');

interface CardapioItem {
    id: number;
    nome: string;
    descricao: string;
    preco: string;
    imagem_url: string;
}

async function carregarCardapio() { // (2) importante 

    if (!menuContainer) {
        console.error('Erro crítico: O contêiner do menu com id "menu-container" não foi encontrado no HTML.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cardapio');

        if (!response.ok) {
            throw new Error('Erro ao buscar o cardápio.');
        }

        const cardapioItens: CardapioItem[] = await response.json();

        menuContainer.innerHTML = '';

        if (cardapioItens.length === 0) {
            menuContainer.innerHTML = '<p>Nenhum item no cardápio.</p>';
            return;
        }

        cardapioItens.forEach(item => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.setAttribute('data-id', item.id.toString());
            cardElement.setAttribute('data-preco', item.preco);

            const precoFormatado = parseFloat(item.preco).toFixed(2).replace('.', ',');

            cardElement.innerHTML = `
                <img src="${item.imagem_url}" alt="imagem da ${item.nome}">
                <h1>${item.nome}</h1>
                <p>${item.descricao}</p>
                <p>Preço: R$ ${precoFormatado}</p>
                <button class="botqntd1"> - </button>
                <button class="botqntd">0</button>
                <button class="botqntd2"> + </button> <br>
                <button class="add">Adicionar ao carrinho</button>
            `;

            menuContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Erro ao carregar o cardápio:', error);
        menuContainer.innerHTML = '<p style="color: red;">Não foi possível carregar o cardápio. Verifique sua conexão ou tente novamente mais tarde.</p>';
    }
}

if (menuContainer) {
    menuContainer.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const cardElement = target.closest('.card');

        if (!cardElement) {
            return;
        }

        const quantidadeView = cardElement.querySelector('.botqntd') as HTMLButtonElement;
        let quantidadeAtual = parseInt(quantidadeView.textContent || '0');

        // +
        if (target.classList.contains('botqntd2')) {
            quantidadeAtual++;
            quantidadeView.textContent = quantidadeAtual.toString();
        }

        // -
        if (target.classList.contains('botqntd1')) {
            if (quantidadeAtual > 0) {
                quantidadeAtual--;
                quantidadeView.textContent = quantidadeAtual.toString();
            }
        }

        if (target.classList.contains('add')) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Você precisa estar logado para adicionar itens ao carrinho.');
                window.location.href = 'Login.html';
                return;
            }

            const quantidadeParaAdicionar = parseInt(quantidadeView.textContent || '0');

            if (quantidadeParaAdicionar <= 0) {
                alert('Por favor, selecione uma quantidade maior que zero antes de adicionar ao carrinho.');
                return;
            }


            const itemId = cardElement.getAttribute('data-id');
            const itemName= cardElement.querySelector('h1')?.textContent;
            const itemPrice = cardElement.getAttribute('data-preco');

            if (itemId && itemName && itemPrice) {
                const itemParaAdicionar = {
                    id: parseInt(itemId),
                    nome: itemName,
                    preco: parseFloat(itemPrice),
                    quantidade: quantidadeParaAdicionar
                };
                adicionarAoCarrinho(itemParaAdicionar);
                alert(`${quantidadeParaAdicionar} x ${itemName} adicionado ao carrinho.`);
                quantidadeView.textContent = '0';
            }
        }

    });
};


function adicionarAoCarrinho(item: { id: number; nome: string; preco: number; quantidade: number; }) { // storage
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const itemExistente = carrinho.find((i: any) => i.id === item.id);

    if (itemExistente) {
        itemExistente.quantidade += item.quantidade;
    } else {
        carrinho.push(item);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}


    
carregarCardapio();