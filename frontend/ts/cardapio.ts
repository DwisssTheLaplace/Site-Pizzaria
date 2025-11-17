const menuContainer = document.getElementById('menu-container');

interface CardapioItem {
    id: number;
    nome: string;
    descricao: string;
    preco: string;
    imagem_url: string;
}

async function carregarCardapio() {

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

carregarCardapio();