async function carregarDadosDoPerfil() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/user-perfil', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer${token}`
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            console.error('Sessão invalida. Por favor, faça login novamente.');
            localStorage.removeItem('authToken');
            window.location.href = 'Login.html';
        }
    } catch (error) {
            console.error('Erro ao carregar os dados do perfil:', error);
        }
}

carregarDadosDoPerfil();

                