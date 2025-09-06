# Encontre Aqui - Sistema Completo de Descoberta de Estabelecimentos

## 📋 Descrição do Projeto

O **Encontre Aqui** é um sistema completo de descoberta de estabelecimentos (restaurantes, lanchonetes, bares, etc.) desenvolvido com tecnologias modernas e responsivas. O sistema inclui:

- Frontend completo e responsivo
- Sistema de autenticação
- Painel administrativo
- Busca e filtros avançados
- Cards 3D interativos
- Validações completas
- Design moderno e atrativo

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos avançados com animações, transições e efeitos 3D
- **Bootstrap 5** - Grid system e componentes responsivos
- **JavaScript Puro** - Interatividade e funcionalidades
- **Google Material Icons** - Ícones modernos
- **Fonte Nunito** - Tipografia consistente

### Design
- **Cards 3D** - Efeitos de profundidade e interatividade
- **Navbar moderna** com menu hamburguer responsivo
- **Footer consistente** em todas as páginas
- **Modais** para confirmações e mensagens
- **Animações suaves** e transições elegantes

## 📁 Estrutura de Arquivos

```
encontre-aqui/
├── index.html                 # Home Page
├── login.html                 # Login
├── cadastro.html              # Criação de conta
├── recuperar-senha.html       # Recuperação de senha
├── verificacao.html           # Verificação de email
├── restaurantes.html          # Listagem de restaurantes
├── lanchonetes.html           # Listagem de lanchonetes
├── espacos-guardados.html     # Estabelecimentos salvos
├── detalhes-restaurante.html  # Detalhes de restaurante
├── detalhes-lanchonete.html   # Detalhes de lanchonete
├── css/
│   ├── main.css              # Estilos principais
│   ├── auth.css              # Estilos de autenticação
│   ├── admin.css             # Estilos do admin
│   └── responsive.css        # Responsividade
├── js/
│   ├── main.js               # JavaScript principal
│   ├── auth.js               # Sistema de autenticação
│   ├── admin.js              # JavaScript do admin
│   └── validacoes.js         # Sistema de validações
├── super-admin/
│   ├── dashboard.html        # Dashboard principal
│   ├── criar-provincia.html  # Criar províncias
│   ├── criar-municipio.html  # Criar municípios
│   ├── criar-categoria.html  # Criar categorias
│   ├── editar-provincia.html # Editar províncias
│   ├── editar-municipio.html # Editar municípios
│   ├── editar-categoria.html # Editar categorias
│   ├── listar-espacos.html   # Listar estabelecimentos
│   ├── detalhes-espaco.html  # Detalhes de estabelecimento
│   ├── listar-donos.html     # Listar donos de espaços
│   └── perfil-admin.html     # Perfil do admin
└── README.md                 # Este arquivo
```

## 🎨 Paleta de Cores

- **Vermelho tags**: #F52F57 (Patrocinado, Tendência, Melhor Avaliado, Promoção)
- **Branco fundo**: #EDEDF4
- **Preto texto em destaque**: #14342B
- **Cinza texto normal**: #4B5563

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (até 767px)

## 🔧 Funcionalidades Implementadas

### Usuário
- ✅ Home page completa com destaques
- ✅ Sistema de busca com filtros
- ✅ Cards 3D interativos
- ✅ Sistema de avaliação por estrelas
- ✅ Favoritos/salvos
- ✅ Login/registro completo
- ✅ Recuperação de senha
- ✅ Verificação de email

### Admin
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de províncias
- ✅ CRUD completo de municípios
- ✅ CRUD completo de categorias
- ✅ Listagem de estabelecimentos
- ✅ Gestão de donos de espaços
- ✅ Perfil do admin
- ✅ Exportação de dados

### Técnicas Avançadas
- ✅ JavaScript puro sem frameworks
- ✅ Animações CSS3
- ✅ Efeitos 3D em cards
- ✅ Menu hamburguer responsivo
- ✅ Validações de formulários
- ✅ Máscaras de input
- ✅ Sistema de notificações
- ✅ Loading states

## 🚀 Como Usar

### Instalação
1. Clone o repositório
2. Abra o arquivo `index.html` em seu navegador
3. O sistema está pronto para uso!

### Navegação
- **Usuário comum**: Use os links do menu principal
- **Admin**: Acesse `/super-admin/dashboard.html`
- **Login**: `/login.html`
- **Cadastro**: `/cadastro.html`

### Estrutura de Dados
- Estabelecimentos são carregados dinamicamente via JavaScript
- Dados são simulados com JavaScript (pronto para integração com backend)
- LocalStorage para dados temporários
- Formulários validados em tempo real

## 🔍 Validações Implementadas

### Formulários
- **Email**: Formato válido
- **Telefone**: Formato brasileiro
- **CPF/CNPJ**: Validadores completos
- **Senha**: Força e confirmação
- **Campos obrigatórios**: Com mensagens de erro específicas

### Segurança
- Sanitização de inputs
- Validação de dados antes de envio
- Proteção contra XSS
- Sistema de autenticação simulado

## 📊 Tecnologias de Performance

- **Lazy loading** de imagens
- **Debouncing** em buscas
- **Animações otimizadas** com CSS3
- **JavaScript modular** e organizado
- **Responsividade otimizada**

## 🤝 Integração Backend

O frontend está completamente preparado para integração com backend:
- Endpoints RESTful simulados
- Estrutura de dados pronta
- Sistema de autenticação JWT-ready
- Formulários com validação completa

## 📞 Suporte

Para dúvidas ou suporte:
- Verifique a console do navegador para erros
- Todos os logs são mostrados em tempo real
- Validações mostram mensagens claras

## 📝 Próximos Passos

1. **Backend**: Integrar com API REST
2. **Banco de Dados**: Conectar com sistema de dados real
3. **Autenticação**: Implementar sistema real de login
4. **Upload de Imagens**: Adicionar sistema de upload
5. **Notificações**: Implementar sistema de notificações push
6. **Chat**: Adicionar sistema de chat com estabelecimentos

---

Desenvolvido com ❤️ pela equipe Encontre Aqui