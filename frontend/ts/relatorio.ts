document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    const container = document.getElementById('relatorio-container');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/relatorios/vendas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar o relatório.');
        }

        const relatorio = await response.json();
        
        container.innerHTML = `
            <div class="relatorio-item">
                Itens vendidos HOJE: 
                <span>${relatorio.vendidosHoje}</span>
            </div>
            <div class="relatorio-item">
                Itens vendidos esse MÊS: 
                <span>${relatorio.vendidosMes}</span>
            </div>
        `;

    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        container.innerHTML = `<p style="color: red;">Não foi possível carregar os dados do relatório.</p>`;
    }
});