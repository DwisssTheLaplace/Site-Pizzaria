const emailInput = document.getElementById('email') as HTMLInputElement;
const senhaInput = document.getElementById('senha') as HTMLInputElement;
const registroButton = document.getElementById('submit') as HTMLButtonElement;
const mensagem = document.getElementById('mensagem') as HTMLParagraphElement;

registroButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    if (!email || !senha) {
        mensagem.textContent = 'Por favor, preencha todos os campos.';
        mensagem.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('authToken', result.token);

            mensagem.style.padding = '10px';
            mensagem.style.border = '2px solid green';
            mensagem.textContent = 'Login realizado com sucesso.';
            mensagem.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3500);
        } else {
            mensagem.textContent = result.error;
            mensagem.style.padding = '10px';
            mensagem.style.border = '2px solid red';
            mensagem.style.color = 'red';
        }
    } catch (error) {
        mensagem.textContent = 'Erro ao conectar com o servidor.';
        mensagem.style.color = 'red';
    }
    });