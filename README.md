# Trabalho Prático - Semana 13

Nesta etapa, você irá evoluir o projeto do semestre, montando um ambiente de desenvolvimento mais completo, típico de projetos profissionais. Nesse processo, vamos utilizar um **servidor backend simulado** com o JSON Server, que fornece uma APIs RESTful a partir de um arquivo JSON.

Para este projeto, além de migrarmos do JSON para o JSON Server, vamos permitir o cadastro e a alteração dos dados da entidade principal (CRUD).

## Informações Gerais

- Nome: Maria Luiza Sousa Montaño
- Matrícula: 925569
- Proposta de projeto escolhida: Previsão do tempo
- Breve descrição sobre seu projeto: O projeto é um site de previsão do tempo que permite aos usuários buscar a previsão para diferentes cidades. Ele exibe informações como temperatura, condições climáticas e probabilidade de chuva para os próximos dias. O site é projetado para ser fácil de usar, com uma interface limpa e intuitiva, e é ideal para quem deseja se manter informado sobre o clima em suas cidades favoritas.

**Prints do trabalho**

<< DADOS DO DB.JSON (ENTIDADE PRINCIPAL E SECUNDÁRIA) >>

```json
{
  "cidades": [
    {
      "id": 1,
      "nome": "São Paulo",
      "cityCode": 999,
      "estado": "SP",
      "descricaoCurta": "A maior metrópole do Brasil",
      "descricaoCompleta": "São Paulo é o centro financeiro do país, com clima subtropical úmido e variações frequentes de temperatura.",
      "imagem": "https://upload.wikimedia.org/wikipedia/commons/thumb/...",
      "categoria": "Grande Metrópole",
      "populacao": 12300000,
      "tags": ["metrópole", "sudeste", "urbano"],
      "destaque": true
    }
  ],
  "categorias": [
    { "id": 1, "nome": "Grande Metrópole" },
    { "id": 2, "nome": "Capital" },
    { "id": 3, "nome": "Cidade Histórica" },
    { "id": 4, "nome": "Litoral" }
  ],
  "favoritos": []
}
```

**Prints do trabalho**

![Tela inicial do TampBR](imagens/tela-inicial.png)

![Tela de detalhes do TampBR](imagens/tela-detalhes.png)


## **Orientações Gerais**

Nesse projeto você vai encontrar a seguinte estrutura base:

* **Pasta db**
  Essa pasta contém um único arquivo: `db.json`. Esse arquivo serve de banco de dados simulado e nele você deve colocar as estruturas de dados que o seu projeto manipula.
  * **OBS**: Já incluímos a estrutura de usuários como exemplo e para que você possa utilizar no seu projeto. Se precisar, faça os ajustes necessários para seu projeto.
* **Pasta public**
  Nessa pasta você deve colocar todos os arquivos do seu site (front end). Aqui vão os arquivos HTML, CSS, JavaScript, imagens, vídeos e tudo o mais que precisar para a interface do usuário.
* **Arquivo README.md**
  Nesse arquivo é onde são colocadas as informações de quem está desenvolvendo o projeto e os registros solicitados no enunciado da tarefa.
* **Arquivo .gitignore**
  Configuração do que deve ser ignorado pelo git evitando que seja enviado para o servidor no GitHub.
* **Arquivo package.json**
  Considerado o manifesto do projeto ou arquivo de configuração. Nele são incluídas as informações básicas sobre o projeto (descrição, versão, palavras-chave, licença, copyright), a lista de pacotes dos quais o projeto depende tanto para desenvolvimento quanto execução, uma lista de  scripts do projeto, entre outras opções.
  * **OBS**: Esse arquivo é criado assim que o projeto é iniciado por meio do comando `npm init`.
  * **OBS2**: Esse arquivo já traz a informação de necessidade do JSONServer.
* **Pasta node_modules**
  Local onde ficam os pacotes dos quais o projeto depende. Evite enviar essa pasta para o repositório remoto. Essa pasta é reconstruída toda vez que se executa o comando `npm install`.

**Ambiente de desenvolvimento (IMPORTANTE)**

> A partir de agora, **NÃO utilizamos mais o LiveServer/FiveServer** durante o processo de desenvolvimento. O próprio JSONServer faz o papel de servidor.

Para iniciar o JSONServer e acessar os arquivos do seu site, siga os seguintes passos:

1. Abra a pasta do projeto dentro da sua IDE (por exemplo, Visual Studio Code)
2. Abra uma janela de terminal e certifique-se que a pasta do terminal é a pasta do projeto
3. Execute o comando `npm install`
   Isso vai reconstruir a pasta node_modules e instalar todos os pacotes necessários para o nosso ambiente de desenvolvimento (Ex: JSONServer).
4. Execute o comando `npm start`
   Isso vai executar o JSONServer e permitir que você consiga acessar o seu site no navegador.
5. Para testar o projeto:
   1. **Site Front End**: abra um navegador e acesse o seu site pela seguinte URL: 
      [http://localhost:3000]()
   2. **Site Back End**: abra o navegador e acesse as informações da estrutura de usuários por meio da API REST do JSONServer a partir da seguinte URL: 
      [http://localhost:3000/usuarios](http://localhost:3000/usuarios)

Ao criar suas estruturas de dados no arquivo db.json, você poderá obter estes dados através do endereço: http://localhost:3000/SUA_ESTRUTURA, tal qual como foi feito com a estrutura de usuários. **IMPORTANTE**: Ao editar o arquivo db.json, é necessário parar e reiniciar o JSONServer.

**IMPORTANTE:** Assim como informado anteriormente, capriche nesta etapa, pois você vai precisar dessa parte para as próximas semanas. 

**IMPORTANTE:** Você deve trabalhar:

* na pasta **`public`,** para os arquivos de front end, mantendo os arquivos **`index.html`**, **`detalhes.html`**, **`styles.css`** e **`app.js`** com estes nomes, e
* na pasta **`db`**, com o arquivo `db.json`.

Deixe todos os demais arquivos e pastas desse repositório inalterados. **PRESTE MUITA ATENÇÃO NISSO.**
