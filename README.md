Projeto: Busca de Filmes e Atores (API The Movie DB)

Este projeto é uma expansão de uma aplicação web simples, desenvolvida em HTML, CSS e JavaScript puro, que se conecta à API pública do The Movie Database (TMDb) para buscar informações sobre filmes e atores.

A expansão implementa funcionalidades avançadas, como busca detalhada de atores, filtros de filmes por categoria e

 exibição de detalhes complementares de filmes.

Funcionalidades Implementadas

A aplicação oferece as seguintes funcionalidades de busca e visualização:

1.
Busca por Filmes/Séries:

•
Pesquisa por termo no título.

•
Paginação para navegar entre os resultados.



2.
Busca por Atores:

•
Pesquisa por termo no nome do ator.

•
Exibição da foto, popularidade e uma lista de filmes/séries conhecidas.



3.
Filtros Avançados de Filmes:

•
Permite refinar a busca de filmes usando filtros de Ano, Gênero e Idioma.



4.
Detalhes de Filmes:

•
Ao clicar em um filme, é exibida uma tela de detalhes com informações complementares obtidas da API, incluindo:

•
Sinopse

•
Gêneros

•
Duração

•
Avaliação

•
Diretor

•
Elenco Principal

•
Data de Lançamento





Estrutura do Projeto

O projeto é composto por três arquivos principais:

•
index.html: Estrutura da página web, incluindo os campos de busca, filtros e áreas de exibição dos resultados.

•
estilos.css: Estilização da aplicação.

•
app.js: Toda a lógica de interação com o DOM e as chamadas à API do TMDb.

Configuração e Execução

Pré-requisitos

Passos para Executar

1.
Baixe os arquivos (index.html, estilos.css, app.js).

2.
Inicie um Servidor Local: Devido às restrições de segurança do navegador (CORS), o arquivo app.js precisa ser executado a partir de um servidor web local.

•
Usando Python (Recomendado):

•
Usando Node.js (Se tiver o http-server instalado):



3.
Acesse a Aplicação: Abra seu navegador e acesse http://localhost:8080 (ou a porta que seu servidor estiver usando).

4.
Utilize a Busca: Digite um termo no campo de busca e selecione o tipo de pesquisa (Filmes/Séries ou Atores).

