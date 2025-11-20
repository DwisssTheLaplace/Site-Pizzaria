document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = 'Login.html'; return; }

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) { document.body.innerHTML = '<h1>ID do item não fornecido.</h1>'; return; }

    const nomeInput = document.getElementById('nome') as HTMLInputElement;
    const descricaoInput = document.getElementById('descricao') as HTMLTextAreaElement;
    const precoInput = document.getElementById('preco') as HTMLInputElement;
    const form = document.getElementById('form-edicao');
    const mensagemEl = document.getElementById('mensagem');

    try {
        const response = await fetch(`http://localhost:3000/cardapio/item/${itemId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const item = await response.json();
        nomeInput.value = item.nome;
        descricaoInput.value = item.descricao;
        precoInput.value = item.preco;
    } catch (error) {
        (document.getElementById('form-container') as HTMLElement).innerHTML = `<p style="color: red;">Não foi possível carregar os dados do item.</p>`;
    }

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const dadosAtualizados = {
            nome: nomeInput.value,
            descricao: descricaoInput.value,
            preco: precoInput.value
        };

        try {
            const response = await fetch(`http://localhost:3000/cardapio/item/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dadosAtualizados)
            });
            const result = await response.json();

            if (response.ok && mensagemEl) {
                mensagemEl.textContent = result.message;
                mensagemEl.style.color = 'green';
            } else if (mensagemEl) {
                mensagemEl.textContent = result.error;
                mensagemEl.style.color = 'red';
            }
        } catch (error) {
            if (mensagemEl) mensagemEl.textContent = 'Erro de conexão.';
        }
    });
});