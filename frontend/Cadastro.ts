const nomeInput = document.getElementById('nome') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const senhaInput = document.getElementById('senha') as HTMLInputElement;
const registroButton = document.getElementById('Cadastrar') as HTMLButtonElement;
const mensagem = document.getElementById('mensagem') as HTMLParagraphElement;

registroButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!nome || !email || !senha) {
        mensagem.textContent = 'Por favor, preencha todos os campos.';
        mensagem.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, cargo: 'cliente' }),
        });

        const result = await response.json();

        if (response.ok) {
            mensagem.style.padding = '10px';
            mensagem.style.border = '2px solid green';
            mensagem.textContent = result.message;
            mensagem.style.color = 'green';
        } else {
            mensagem.style.padding = '10px';
            mensagem.style.border = '2px solid red';
            mensagem.textContent = result.error;
            mensagem.style.color = 'red';
        }
    } catch (error) {
        mensagem.textContent = 'Erro ao conectar com o servidor.';
        mensagem.style.color = 'red';
    }
});