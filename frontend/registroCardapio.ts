const nomeInput = document.getElementById('nome') as HTMLInputElement;
const descricaoInput = document.getElementById('descricao') as HTMLInputElement;
const precoInput = document.getElementById('preco') as HTMLInputElement;
const imagemInput = document.getElementById('imagem') as HTMLInputElement;
const Enviar = document.getElementById('enviar') as HTMLButtonElement;

Enviar.addEventListener('click', async (event) => {
    event.preventDefault();
    const nome = nomeInput.value.trim();
    const descricao = descricaoInput.value.trim();
    const preco = precoInput.value.trim();
    const imagem = imagemInput.value.trim();

    
