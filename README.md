# Matriz Interativa (Angular + Spring Boot)

Este projeto é uma aplicação full-stack composta por uma matriz interativa de alta performance no frontend (Angular) e um servidor de ingestão de dados no backend (Java Spring Boot).

A aplicação registra o movimento do mouse na matriz e envia os eventos de **capture** e **finalize** para o backend, juntamente com o ID da sessão e o nome do usuário.

---

## 🚀 Passo a passo para rodar o projeto

Para que o projeto funcione corretamente, **inicie o Backend primeiro**, garantindo que a API já esteja disponível quando o frontend tentar enviar os dados.

---

### 1. Subindo o Backend (Docker)

O backend roda em um container Docker na porta **1414**. Certifique-se de ter o **Docker** instalado e em execução.

> **Pré-requisito:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.

1. Abra um terminal na **raiz do projeto** (onde está o `docker-compose.yml`).
2. Execute o comando abaixo para construir a imagem e subir o container:
   ```bash
   docker-compose up --build
   ```
3. Aguarde a conclusão do build e da inicialização. Você verá no log uma mensagem similar a:
   ```
   Started Application in X.XXX seconds
   ```
4. O backend estará disponível em: **http://localhost:1414**

> **Dica:** Para verificar se o backend está saudável, acesse no navegador:
> [http://localhost:1414/actuator/health](http://localhost:1414/actuator/health)
>
> A resposta esperada é: `{"status":"UP"}`

> **Subindo em segundo plano (opcional):** Use a flag `-d` para liberar o terminal:
> ```bash
> docker-compose up --build -d
> ```
> Para parar o container depois: `docker-compose down`

---

### 2. Subindo o Frontend (Angular)

O frontend foi desenvolvido em **Angular 17+** com Standalone Components e otimizações de alta performance para renderizar 4.000 pontos a 60fps.

> **Pré-requisito:** [Node.js](https://nodejs.org/) instalado (versão **20.19+** ou **22.12+** recomendada).

1. Abra um **novo terminal** (mantenha o container do backend rodando).
2. Acesse a pasta do frontend:
   ```bash
   cd frontend
   ```
3. Instale as dependências (**necessário apenas na primeira vez**):
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
5. Aguarde a mensagem de compilação:
   ```
   Application bundle generation complete.
   ```
6. O frontend estará disponível em: **http://localhost:4200**

---

### 3. Acessando a Aplicação

Com backend e frontend rodando:

1. Abra o navegador e acesse: **[http://localhost:4200](http://localhost:4200)**
2. Clique no botão **Iniciar**.
3. Insira seu nome e comece a desenhar clicando e arrastando o mouse pela matriz.
4. Clique em **Finalizar**.
5. Observe no terminal do **Backend** (ou nos logs do Docker) os dados trafegados com sucesso!

---

## 🛑 Parando os serviços

- **Frontend:** pressione `Ctrl + C` no terminal onde o `npm start` está rodando.
- **Backend (Docker):** pressione `Ctrl + C` no terminal do Docker, ou execute:
  ```bash
  docker-compose down
  ```

---

## 🗂️ Estrutura do Projeto

```
projt/
├── backend/           # API Spring Boot (Java 17)
│   ├── Dockerfile     # Imagem Docker do backend
│   └── src/
├── frontend/          # Aplicação Angular 17+
│   └── src/
├── docker-compose.yml # Orquestração do backend via Docker
└── README.md
```
