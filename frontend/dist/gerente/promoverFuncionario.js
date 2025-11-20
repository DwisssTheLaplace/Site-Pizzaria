"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }
    const form = document.getElementById('form-promocao');
    const emailInput = document.getElementById('email');
    const mensagemEl = document.getElementById('mensagem');
    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!emailInput || !mensagemEl)
            return;
        const email = emailInput.value.trim();
        if (!email) {
            mensagemEl.textContent = 'Por favor, insira um e-mail.';
            mensagemEl.style.color = 'red';
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/usuarios/promover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });
            const result = await response.json();
            if (response.ok) {
                mensagemEl.textContent = result.message;
                mensagemEl.style.color = 'green';
                emailInput.value = '';
            }
            else {
                mensagemEl.textContent = result.error;
                mensagemEl.style.color = 'red';
            }
        }
        catch (error) {
            mensagemEl.textContent = 'Erro de conexão com o servidor.';
            mensagemEl.style.color = 'red';
        }
    });
});
