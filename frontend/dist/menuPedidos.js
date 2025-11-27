"use strict";
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }
    const response = await fetch('http://localhost:3000/meus-pedidos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        const pedidos = await response.json();
        const container = document.getElementById('pedidos-container');
        // html
        console.log(pedidos);
    }
});
