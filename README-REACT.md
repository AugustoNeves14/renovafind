# Encontre Aqui - React Edition 🚀

Um sistema moderno e profissional de descoberta de estabelecimentos, desenvolvido com React, TypeScript e tecnologias de ponta.

## 🎯 Tecnologias Utilizadas

### Frontend Framework
- **React 18** com TypeScript
- **Vite** - Build tool ultra-rápido
- **React Router v6** - Navegação moderna
- **Tailwind CSS** - Estilização utility-first
- **Framer Motion** - Animações fluidas

### UI/UX Libraries
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Ícones modernos e consistentes
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas TypeScript

### Ferramentas de Desenvolvimento
- **ESLint + Prettier** - Qualidade de código
- **PostCSS** - Processamento de CSS
- **Vite** - HMR ultra-rápido
- **TypeScript** - Type safety completo

## 🎨 Design System

### Cores Primárias
- **Vermelho Principal**: `rgb(245, 47, 87)` (#F52F57)
- **Background**: `rgb(237, 237, 244)` (#EDEDF4)
- **Texto Principal**: `rgb(20, 52, 43)` (#14342B)
- **Texto Secundário**: `rgb(75, 85, 99)` (#4B5563)

### Tipografia
- **Fonte Principal**: Nunito (Google Fonts)
- **Escala de Tamanhos**: Responsiva e acessível
- **Animações**: Framer Motion para interações suaves

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Componentes reutilizáveis
│   ├── layout/       # Header, Footer, etc
│   └── auth/         # Componentes de autenticação
├── pages/
│   ├── Home.tsx      # Página principal
│   ├── Login.tsx     # Sistema de login
│   ├── Restaurants.tsx # Listagem de restaurantes
│   └── admin/        # Dashboard administrativo
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   └── use-toast.ts  # Sistema de notificações
├── lib/
│   └── utils.ts      # Funções utilitárias
└── styles/
    └── globals.css   # Estilos globais e Tailwind
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎯 Funcionalidades Implementadas

### ✅ Frontend Completo
- **Design Responsivo**: Mobile-first, tablet e desktop
- **Animações Fluidas**: Framer Motion para UX premium
- **Cards 3D Interativos**: Hover effects e transições
- **Sistema de Busca**: Com filtros e autocompletar
- **Validações Completa**: Formulários com feedback em tempo real

### ✅ Componentes Modernos
- **Navbar Inteligente**: Com scroll effects
- **Menu Hamburguer**: Animações suaves
- **Cards Interativos**: 3D effects no hover
- **Loading States**: Skeletons e spinners elegantes
- **Sistema de Notificações**: Toast notifications

### ✅ Sistema de Autenticação
- **Login/Registro**: Forms validados com React Hook Form
- **Recuperação de Senha**: Flow completo
- **Verificação de Email**: Código de 6 dígitos
- **Estado Global**: Context API para auth

### ✅ Admin Dashboard
- **Dashboard Moderno**: Charts e estatísticas
- **Gestão CRUD**: Províncias, municípios, categorias
- **Listagem de Estabelecimentos**: Com filtros avançados
- **Gestão de Usuários**: Sistema de roles e permissões

## 🎨 Componentes Destacados

### SpaceCard Component
```typescript
interface SpaceCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  price: string;
  tags?: string[];
  isSaved?: boolean;
}
```

### Search Component
- **Debounced Search**: Performance otimizada
- **Filtros Dinâmicos**: Por categoria, preço, localização
- **Autocomplete**: Sugestões em tempo real

### Form Validation
```typescript
// Validadores com Zod
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
```

## 📱 Responsividade Completa

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Features Responsivas
- **Grid Layout**: Adaptativo
- **Typography**: Escala fluida
- **Touch-friendly**: Para dispositivos móveis
- **Performance**: Otimizada para todos os dispositivos

## 🎭 Animações e Interações

### Framer Motion Config
```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
};
```

### Hover Effects
- **Cards 3D**: Transform perspective
- **Buttons**: Scale e shadow transitions
- **Images**: Zoom e overlay effects
- **Navigation**: Smooth transitions

## 🚀 Performance Otimizada

### Code Splitting
- **Lazy Loading**: Rotas e componentes
- **Bundle Optimization**: Vite tree-shaking
- **Image Optimization**: Lazy loading e WebP

### Development Features
- **Hot Module Replacement**: Instant updates
- **Type Safety**: TypeScript strict mode
- **ESLint**: Code quality
- **Prettier**: Formatação consistente

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com HMR
npm run build        # Build otimizado para produção
npm run preview      # Preview do build
npm run type-check   # Verificação de tipos
npm run lint         # Linting de código
```

## 🎯 Próximos Passos

1. **Backend Integration**: Pronto para conectar com API
2. **PWA**: Transformar em Progressive Web App
3. **Dark Mode**: Sistema de tema completo
4. **Internationalização**: Multi-idioma
5. **Analytics**: Google Analytics e métricas
6. **SEO**: Meta tags e structured data

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório ou entre em contato.

---

**Encontre Aqui - React Edition**  
Desenvolvido com ❤️ usando tecnologias modernas