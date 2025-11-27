document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'Login.html'; return; }

    const container = document.getElementById('lista-cardapio-container');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/cardapio');
        const itens = await response.json();
        
        container.innerHTML = ''; 
        itens.forEach((item: any) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-lista';
            itemElement.innerHTML = `
                <span>${item.nome}</span>
                <a href="editarItemForm.html?id=${item.id}"><button>Editar</button></a>
            `;
            container.appendChild(itemElement);
        });
    } catch (error) {
        container.innerHTML = `<p style="color: red;">Não foi possível carregar os itens.</p>`;
    }
});