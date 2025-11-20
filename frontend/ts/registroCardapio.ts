document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça o login como funcionário ou gerente.');
        window.location.href = '/Login.html'; 
        return;
    }

    const nomeInput = document.getElementById('nome') as HTMLInputElement;
    const descricaoInput = document.getElementById('descricao') as HTMLInputElement;
    const precoInput = document.getElementById('preco') as HTMLInputElement;
    const imagemInput = document.getElementById('imagem') as HTMLInputElement;
    const Enviar = document.getElementById('enviar') as HTMLButtonElement;

    if (!Enviar) return; 

    Enviar.addEventListener('click', async (event) => {
        event.preventDefault();

        const nome = nomeInput.value.trim();
        const descricao = descricaoInput.value.trim();
        const preco = precoInput.value.trim();
        
        if (!nome || !descricao || !preco || !imagemInput.files || imagemInput.files.length === 0) {
            alert('Por favor, preencha todos os campos, incluindo a imagem.');
            return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('preco', preco);
        formData.append('imagem', imagemInput.files[0]); 

        try {
            const response = await fetch('http://localhost:3000/cardapio/item', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert('Item do cardápio registrado com sucesso.');
                nomeInput.value = '';
                descricaoInput.value = '';
                precoInput.value = '';
                imagemInput.value = '';
            } else {
                alert(`Erro ao registrar o item: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});