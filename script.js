const API_URL = 'https://rickandmortyapi.com/api/character';
let paginaAtual = 1;
let todosPersonagens = []; // Array para guardar todos os personagens da PÁGINA ATUAL

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('anterior').addEventListener('click', () => mudarPagina('anterior'));
    document.getElementById('proxima').addEventListener('click', () => mudarPagina('proxima'));
    
    buscarPersonagensAsync(paginaAtual);

    // Event listener da busca
    document.getElementById('busca').addEventListener('input', function() {
        const textoBuscado = this.value.toLowerCase();
        filtrarPersonagens(textoBuscado); 
    });
});

async function buscarPersonagensAsync(pagina) {
    try {
        const response = await fetch(`${API_URL}?page=${pagina}`);
        if (!response.ok) {
            throw new Error('Erro HTTP: ' + response.status);
        }
        const data = await response.json();
        
        atualizarBotoesNavegacao(data.info);
        
        // ADICIONADO: Guardamos os personagens da página atual para o filtro
        todosPersonagens = data.results; 
        exibirPersonagens(todosPersonagens);

    } catch (error) {
        console.error('Falha ao buscar personagens:', error);
    }
}

function mudarPagina(direcao) {
    if (direcao === 'anterior' && paginaAtual > 1) {
        paginaAtual--;
    } else if (direcao === 'proxima') {
        paginaAtual++;
    }
    
    document.getElementById('pagina-atual').textContent = `Página ${paginaAtual}`;
    
    buscarPersonagensAsync(paginaAtual);
}

function atualizarBotoesNavegacao(info) {
    const btnAnterior = document.getElementById('anterior');
    const btnProxima = document.getElementById('proxima');
    
    btnAnterior.disabled = paginaAtual === 1;
    btnProxima.disabled = paginaAtual === info.pages;
}

function exibirPersonagens(personagens) {
    const container = document.getElementById('personagens-container');

    const htmlPersonagens = personagens.map(personagem => {
        return `
            <article class="card" data-id="${personagem.id}"> 
                <img src="${personagem.image}" alt="${personagem.name}">
                <div class="card-info">
                    <h3>${personagem.name}</h3>
                    <p>Status: ${personagem.status}</p>
                    <p>Espécie: ${personagem.species}</p>
                </div>
            </article>
        `;
    }).join(''); 

    container.innerHTML = htmlPersonagens;

    // --- ADICIONADO: Adiciona os listeners de clique nos cards ---
    const cards = container.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            mostrarDetalhes(id); // Chama a nova função de detalhes
        });
    });
}

async function mostrarDetalhes(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes do personagem');
        }
        const personagem = await response.json();

        const listaView = document.getElementById('lista-view');
        const detalheContainer = document.getElementById('detalhe-container');

        detalheContainer.innerHTML = `
            <article class="detalhe-card">
                <button id="btn-voltar" class="btn-nav"><-- Voltar</button>
                <img src="${personagem.image}" alt="${personagem.name}">
                <h2>${personagem.name}</h2>
                <p><strong>Status:</strong> ${personagem.status}</p>
                <p><strong>Espécie:</strong> ${personagem.species}</p>
                <p><strong>Gênero:</strong> ${personagem.gender}</p>
                <p><strong>Origem:</strong> ${personagem.origin.name}</p>
                <p><strong>Localização Atual:</strong> ${personagem.location.name}</p>
            </article>
        `;

        listaView.style.display = 'none';
        detalheContainer.style.display = 'flex'; 

        document.getElementById('btn-voltar').addEventListener('click', () => {
            listaView.style.display = 'block';
            detalheContainer.style.display = 'none';
            detalheContainer.innerHTML = ''; 
        });

    } catch (error) {
        console.error('Falha ao carregar detalhes:', error);
    }
}


function filtrarPersonagens(textoBusca) {
    
    if (!textoBusca) {
        exibirPersonagens(todosPersonagens); 
        return;
    }

    const personagensFiltrados = todosPersonagens.filter(personagem => {
        return personagem.name.toLowerCase().includes(textoBusca);
    });

    exibirPersonagens(personagensFiltrados);
}
