# AngoCine - Plataforma de Streaming Premium

AngoCine é uma plataforma de streaming moderna e elegante, desenvolvida com Angular para o frontend e Node.js com Express para o backend. O projeto oferece uma experiência de usuário premium com design responsivo, modo escuro, e funcionalidades avançadas de streaming.

![AngoCine Logo](frontend/angocine/src/assets/images/logo.png)

## 🚀 Funcionalidades

- **Catálogo de Filmes**: Navegação e busca avançada com filtros por gênero, ano, idioma e classificação
- **Player de Vídeo**: Reprodutor HLS.js com controles personalizados, PiP, tela cheia e legendas
- **Perfis de Usuário**: Suporte para múltiplos perfis por conta, incluindo perfis infantis
- **Watchlist**: Lista de filmes para assistir depois
- **Histórico de Visualização**: Acompanhamento do progresso de visualização
- **Avaliações e Comentários**: Sistema de avaliação com estrelas e comentários
- **Modo Escuro**: Alternância automática e manual entre temas claro e escuro
- **Design Responsivo**: Experiência otimizada para desktop, tablet e dispositivos móveis
- **Painel Administrativo**: Gerenciamento de usuários, filmes e conteúdo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 14+**: Framework para desenvolvimento do frontend
- **Bootstrap 5**: Framework CSS para design responsivo
- **HLS.js**: Biblioteca para streaming de vídeo adaptativo
- **SCSS**: Pré-processador CSS para estilos avançados
- **Font Awesome**: Ícones vetoriais
- **ngx-bootstrap**: Componentes Bootstrap para Angular

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **JWT**: Autenticação baseada em tokens
- **PostgreSQL/SQLite**: Banco de dados relacional (SQLite para desenvolvimento)
- **bcrypt**: Criptografia de senhas
- **Helmet**: Segurança para aplicações Express
- **Morgan**: Logger de requisições HTTP

## 📋 Requisitos

- Node.js 14+ e npm
- Angular CLI 14+
- PostgreSQL (opcional, SQLite é usado por padrão)

## 🔧 Instalação e Configuração

### Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/angocine.git
cd angocine
```

### Configurando o Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o arquivo .env com suas configurações
npm run dev
```

### Configurando o Frontend

```bash
cd frontend/angocine
npm install
ng serve
```

O aplicativo estará disponível em `http://localhost:4200/`

## 🗄️ Estrutura do Projeto

### Frontend

```
frontend/angocine/
├── src/
│   ├── app/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Componentes de página
│   │   ├── services/         # Serviços
│   │   ├── models/           # Interfaces e modelos
│   │   ├── guards/           # Guards de rota
│   │   ├── pipes/            # Pipes personalizados
│   │   └── directives/       # Diretivas personalizadas
│   ├── assets/               # Recursos estáticos
│   └── environments/         # Configurações de ambiente
```

### Backend

```
backend/
├── src/
│   ├── app.js               # Configuração do Express
│   ├── server.js            # Ponto de entrada
│   ├── db.js                # Conexão com banco de dados
│   ├── routes/              # Rotas da API
│   ├── controllers/         # Controladores
│   ├── models/              # Modelos de dados
│   └── middleware/          # Middlewares
├── database/                # Arquivos de banco de dados SQLite
└── videos/                  # Arquivos de vídeo para streaming
```

## 🚀 Scripts Disponíveis

### Backend

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm start`: Inicia o servidor em modo de produção
- `npm test`: Executa os testes
- `npm run seed`: Popula o banco de dados com dados iniciais

### Frontend

- `ng serve`: Inicia o servidor de desenvolvimento
- `ng build`: Compila o aplicativo para produção
- `ng test`: Executa os testes unitários
- `ng lint`: Executa o linter

## 📱 Capturas de Tela

![Tela Inicial](frontend/angocine/src/assets/images/screenshots/home.png)
![Detalhes do Filme](frontend/angocine/src/assets/images/screenshots/movie-details.png)
![Player de Vídeo](frontend/angocine/src/assets/images/screenshots/player.png)
![Perfis](frontend/angocine/src/assets/images/screenshots/profiles.png)

## 🔐 Autenticação

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) com tokens de acesso e refresh. O token de acesso expira após 24 horas, e o refresh token após 7 dias.

## 🌐 Implantação

### Frontend

Para implantar o frontend:

```bash
cd frontend/angocine
ng build --prod
# Os arquivos serão gerados na pasta dist/
```

### Backend

Para implantar o backend:

```bash
cd backend
npm install --production
# Configure as variáveis de ambiente para produção
npm start
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Contato

Para questões ou suporte, entre em contato através do email: contato@angocine.com