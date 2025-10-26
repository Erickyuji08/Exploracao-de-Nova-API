// ===== CONFIGURAÇÃO INICIAL (TMDB) =====
// Pegue sua chave gratuita em: https://www.themoviedb.org/settings/api
const CHAVE_API = "2055690676f8bbd715193cb9ef233dbf"; // Substitua por sua chave
const URL_BASE = "https://api.themoviedb.org/3/";

// ===== CONEXÃO COM O HTML =====
const campoBusca = document.getElementById("campo-busca");
const listaResultados = document.getElementById("lista-resultados");
const mensagemStatus = document.getElementById("mensagem-status");

// ===== VARIÁVEIS DE CONTROLE =====
let termoBusca = "";      // Texto digitado pelo usuário
let paginaAtual = 1;      // Página de resultados
let totalPaginas = 1;     // Total de páginas retornado pela API

// ===== CONEXÃO COM O HTML (NOVOS ELEMENTOS) =====
const selectTipoBusca = document.getElementById("select-tipo-busca");
const filtroAno = document.getElementById("filtro-ano");
const filtroGenero = document.getElementById("filtro-genero");
const filtroIdioma = document.getElementById("filtro-idioma");
const filtrosAvancadosDiv = document.getElementById("filtros-avancados");

// ===== VARIÁVEIS DE CONTROLE (NOVAS) =====
let tipoBusca = "filme"; // 'filme' ou 'ator'

// ===== FUNÇÕES DE UTILIDADE =====

// Função para buscar dados genéricos do TMDB
async function buscarDadosTMDB(endpoint, parametros = {}) {
  const params = new URLSearchParams({
    api_key: CHAVE_API,
    language: 'pt-BR',
    ...parametros
  });
  const url = `${URL_BASE}${endpoint}?${params.toString()}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Erro na API: ${resposta.statusText}`);
  }
  return resposta.json();
}

// Função para buscar e popular os gêneros
async function popularGeneros() {
  try {
    const dados = await buscarDadosTMDB('genre/movie/list');
    dados.genres.forEach(genero => {
      const option = document.createElement('option');
      option.value = genero.id;
      option.textContent = genero.name;
      filtroGenero.appendChild(option);
    });
  } catch (erro) {
    console.error("Erro ao popular gêneros:", erro);
  }
}

// Função para popular idiomas comuns (simplificado)
function popularIdiomas() {
  const idiomas = [
    { code: "en", name: "Inglês" },
    { code: "pt", name: "Português" },
    { code: "es", name: "Espanhol" },
    { code: "fr", name: "Francês" },
    { code: "ja", name: "Japonês" }
  ];

  idiomas.forEach(idioma => {
    const option = document.createElement('option');
    option.value = idioma.code;
    option.textContent = idioma.name;
    filtroIdioma.appendChild(option);
  });
}

// Função para mudar o tipo de busca (filme ou ator)
function mudarTipoBusca(novoTipo) {
  tipoBusca = novoTipo;
  // Esconde ou mostra os filtros avançados
  filtrosAvancadosDiv.style.display = tipoBusca === 'filme' ? 'block' : 'none';
  // Limpa os resultados ao mudar o tipo de busca
  listaResultados.innerHTML = "";
  mensagemStatus.textContent = "";
}

// Inicializa os selects
popularGeneros();
popularIdiomas();

// ===== FUNÇÃO DO BOTÃO "BUSCAR" =====
function buscarFilmes() {
  termoBusca = campoBusca.value.trim(); // remove espaços extras
  paginaAtual = 1;                      // sempre começa da página 1

  // Limpa os filtros ao fazer uma nova busca textual
  filtroAno.value = "";
  filtroGenero.value = "";
  filtroIdioma.value = "";

  if (tipoBusca === 'filme') {
    pesquisarFilmes();
  } else {
    pesquisarAtores();
  }
}

// ===== FUNÇÃO DO BOTÃO "APLICAR FILTROS" (NOVA) =====
function buscarFilmesComFiltro() {
  termoBusca = ""; // Limpa o termo de busca para garantir que a busca seja por filtro
  campoBusca.value = ""; // Limpa o campo de busca visualmente
  paginaAtual = 1;
  pesquisarFilmes();
}

// ===== FUNÇÃO DO BOTÃO "PRÓXIMA PÁGINA" =====
function proximaPagina() {
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    if (tipoBusca === 'filme') {
      pesquisarFilmes();
    } else {
      pesquisarAtores();
    }
  }
}

// ===== FUNÇÃO DO BOTÃO "ANTERIOR" =====
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    if (tipoBusca === 'filme') {
      pesquisarFilmes();
    } else {
      pesquisarAtores();
    }
  }
}

//// ===== FUNÇÃO PRINCIPAL DE PESQUISA (TMDB) ======
async function pesquisarFilmes() {
  const ano = filtroAno.value.trim();
  const genero = filtroGenero.value;
  const idioma = filtroIdioma.value;

  let endpoint = '';
  let parametros = {};
  let statusMensagem = '';

  // Define se a busca é por termo ou por filtro
  if (termoBusca) {
    endpoint = 'search/movie';
    parametros = { query: termoBusca, page: paginaAtual };
    statusMensagem = `para "${termoBusca}"`;
  } else if (ano || genero || idioma) {
    endpoint = 'discover/movie';
    parametros = { 
        page: paginaAtual, 
        sort_by: 'popularity.desc',
        primary_release_year: ano || undefined,
        with_genres: genero || undefined,
        with_original_language: idioma || undefined,
    };
    statusMensagem = 'com os filtros aplicados';
  } else {
    mensagemStatus.textContent = "Digite um termo de busca ou aplique um filtro.";
    listaResultados.innerHTML = "";
    return;
  }

  mensagemStatus.textContent = `🔄 Buscando resultados ${statusMensagem}, aguarde...`;
  listaResultados.innerHTML = "";

  try {
    const dados = await buscarDadosTMDB(endpoint, parametros);

    // Verifica se encontrou algo
    if (dados.results.length === 0) {
      mensagemStatus.textContent = "Nenhum resultado encontrado.";
      listaResultados.innerHTML = "";
      totalPaginas = 1;
      return;
    }

    // Atualiza o total de páginas
    totalPaginas = dados.total_pages;

    // Mostra os filmes na tela
    exibirFilmes(dados.results);
    mensagemStatus.textContent = `Página ${paginaAtual} de ${totalPaginas} — ${statusMensagem}`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados. Verifique sua conexão e se a CHAVE_API foi configurada corretamente.";
  }
}

// ===== FUNÇÃO PARA MOSTRAR FILMES (TMDB) =====
function exibirFilmes(filmes) {
  listaResultados.innerHTML = ""; // limpa os resultados anteriores

  filmes.forEach(filme => {
    // Ignora resultados que não são filmes (se estiver usando multi search)
    if (filme.media_type && filme.media_type !== 'movie' && filme.media_type !== 'tv') {
        return;
    }
    
    // Cria o container do card
    const div = document.createElement("div");
    div.classList.add("card");
    div.setAttribute("data-filme-id", filme.id);
    div.onclick = () => mostrarDetalhesFilme(filme.id);

    // URL base para imagens do TMDB
    const BASE_URL_IMAGEM = "https://image.tmdb.org/t/p/w300";

    // Se não houver pôster, usa uma imagem padrão
    const poster = filme.poster_path
      ? `${BASE_URL_IMAGEM}${filme.poster_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Poster";

    // Monta o HTML do card
    div.innerHTML = `
      <img src="${poster}" alt="Pôster do filme ${filme.title || filme.name}">
      <h3>${filme.title || filme.name}</h3>
      <p>Ano: ${filme.release_date ? filme.release_date.substring(0, 4) : (filme.first_air_date ? filme.first_air_date.substring(0, 4) : 'N/A')}</p>
    `;

    // Adiciona o card dentro da lista
    listaResultados.appendChild(div);
  });
}

// ===== FUNÇÃO PARA MOSTRAR ATORES (NOVA) =====
function exibirAtores(atores) {
  listaResultados.innerHTML = ""; // limpa os resultados anteriores

  atores.forEach(ator => {
    // Cria o container do card
    const div = document.createElement("div");
    div.classList.add("card");
    div.setAttribute("data-ator-id", ator.id);
    div.onclick = () => mostrarDetalhesAtor(ator.id);

    // URL base para imagens do TMDB
    const BASE_URL_IMAGEM = "https://image.tmdb.org/t/p/w300";

    // Se não houver foto, usa uma imagem padrão
    const foto = ator.profile_path
      ? `${BASE_URL_IMAGEM}${ator.profile_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Foto";

    // Monta o HTML do card
    div.innerHTML = `
      <img src="${foto}" alt="Foto de ${ator.name}">
      <h3>${ator.name}</h3>
      <p>Popularidade: ${ator.popularity.toFixed(1)}</p>
    `;

    // Adiciona o card dentro da lista
    listaResultados.appendChild(div);
  });
}

// ===== FUNÇÃO PRINCIPAL DE PESQUISA DE ATORES (NOVA) =====
async function pesquisarAtores() {
  // Valida se o campo está vazio
  if (!termoBusca) {
    mensagemStatus.textContent = "Digite o nome de um ator para pesquisar.";
    listaResultados.innerHTML = "";
    return;
  }

  // Mostra mensagem de carregando
  mensagemStatus.textContent = "🔄 Buscando atores, aguarde...";
  listaResultados.innerHTML = "";

  try {
    const dados = await buscarDadosTMDB('search/person', {
        query: termoBusca,
        page: paginaAtual,
    });

    // Verifica se encontrou algo
    if (dados.results.length === 0) {
      mensagemStatus.textContent = "Nenhum ator encontrado.";
      listaResultados.innerHTML = "";
      totalPaginas = 1;
      return;
    }

    // Atualiza o total de páginas
    totalPaginas = dados.total_pages;

    // Mostra os atores na tela
    exibirAtores(dados.results);
    mensagemStatus.textContent = `Página ${paginaAtual} de ${totalPaginas} — mostrando resultados para "${termoBusca}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar dados. Verifique sua conexão e se a CHAVE_API foi configurada corretamente.";
  }
}

// ===== FUNÇÃO PARA MOSTRAR DETALHES DO FILME (NOVA FUNCIONALIDADE) =====
async function mostrarDetalhesFilme(filmeId) {
  mensagemStatus.textContent = "🔍 Buscando detalhes do filme, aguarde...";
  listaResultados.innerHTML = "";

  try {
        // 1. Busca os detalhes do filme
    const detalhes = await buscarDadosTMDB(`movie/${filmeId}`);
    
    // 2. Busca o elenco e equipe
    const creditos = await buscarDadosTMDB(`movie/${filmeId}/credits`);
    
    // Filtra os 5 principais atores e o diretor
    const elenco = creditos.cast.slice(0, 5).map(ator => ator.name).join(', ');
    const diretor = creditos.crew.find(membro => membro.job === 'Director')?.name || 'N/A';

    // Cria a estrutura para exibir os detalhes
    const detalhesHTML = `
      <div class="detalhes-filme">
        <img src="https://image.tmdb.org/t/p/w500${detalhes.poster_path}" alt="Pôster de ${detalhes.title}" class="detalhe-poster">
        <div class="detalhes-info">
          <h2>${detalhes.title} (${detalhes.release_date ? detalhes.release_date.substring(0, 4) : 'N/A'})</h2>
          <p><strong>Sinopse:</strong> ${detalhes.overview || 'Não disponível.'}</p>
          <p><strong>Gêneros:</strong> ${detalhes.genres.map(g => g.name).join(', ')}</p>
          <p><strong>Duração:</strong> ${detalhes.runtime} minutos</p>
          <p><strong>Avaliação:</strong> ${detalhes.vote_average.toFixed(1)}/10 (${detalhes.vote_count} votos)</p>
          <p><strong>Diretor:</strong> ${diretor}</p>
          <p><strong>Elenco Principal:</strong> ${elenco}</p>
          <p><strong>Lançamento:</strong> ${new Date(detalhes.release_date).toLocaleDateString('pt-BR')}</p>
          <button onclick="voltarParaBusca()">Voltar para a Busca</button>
        </div>
      </div>
    `;

    listaResultados.innerHTML = detalhesHTML;
    mensagemStatus.textContent = `Detalhes de "${detalhes.title}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar detalhes do filme.";
  }
}

// Função para voltar à busca (mantendo o termo e a página)
function voltarParaBusca() {
  if (tipoBusca === 'filme') {
    pesquisarFilmes();
  } else {
    pesquisarAtores();
  }
}

// Adiciona o listener para a tecla Enter no campo de busca
campoBusca.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        buscarFilmes();
    }
});

// Garante que os filtros avançados estejam visíveis por padrão ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    filtrosAvancadosDiv.style.display = 'block';
});

// ===== FUNÇÃO PARA MOSTRAR DETALHES DO ATOR (NOVA FUNCIONALIDADE) =====
async function mostrarDetalhesAtor(atorId) {
  mensagemStatus.textContent = "🔍 Buscando detalhes do ator, aguarde...";
  listaResultados.innerHTML = "";

  try {
    // 1. Busca os detalhes do ator
    const detalhes = await buscarDadosTMDB(`person/${atorId}`);
    
    // 2. Busca os créditos (filmes e séries) do ator
    const creditos = await buscarDadosTMDB(`person/${atorId}/combined_credits`);
    
    // Filtra e ordena os 10 principais trabalhos
    const trabalhos = creditos.cast
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    // Cria a lista de trabalhos
    const listaTrabalhos = trabalhos.map(item => {
      const titulo = item.title || item.name;
      const ano = item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A');
      return `<li>${titulo} (${ano}) - como ${item.character || 'N/A'}</li>`;
    }).join('');

    // Cria a estrutura para exibir os detalhes
    const detalhesHTML = `
      <div class="detalhes-filme">
        <img src="https://image.tmdb.org/t/p/w500${detalhes.profile_path}" alt="Foto de ${detalhes.name}" class="detalhe-poster">
        <div class="detalhes-info">
          <h2>${detalhes.name}</h2>
          <p><strong>Nascimento:</strong> ${detalhes.birthday ? new Date(detalhes.birthday).toLocaleDateString('pt-BR') : 'N/A'}</p>
          <p><strong>Local de Nascimento:</strong> ${detalhes.place_of_birth || 'N/A'}</p>
          <p><strong>Biografia:</strong> ${detalhes.biography || 'Não disponível.'}</p>
          <p><strong>Popularidade:</strong> ${detalhes.popularity.toFixed(1)}</p>
          
          <h3>Principais Trabalhos (Top 10)</h3>
          <ul>${listaTrabalhos}</ul>

          <button onclick="voltarParaBusca()">Voltar para a Busca</button>
        </div>
      </div>
    `;

    listaResultados.innerHTML = detalhesHTML;
    mensagemStatus.textContent = `Detalhes de "${detalhes.name}"`;

  } catch (erro) {
    console.error(erro);
    mensagemStatus.textContent = "❌ Erro ao buscar detalhes do ator.";
  }
}

