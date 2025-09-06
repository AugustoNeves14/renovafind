import React, { useState } from 'react';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import SpaceCard from '@/components/ui/SpaceCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const mockSpaces = [
  {
    id: '1',
    name: 'Restaurante Sabor Brasileiro',
    category: 'Restaurante',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    rating: 4.8,
    reviews: 234,
    location: 'Centro, São Paulo',
    price: 'R$ 50-100',
    tags: ['Patrocinado', 'Tendência'],
  },
  {
    id: '2',
    name: 'Lanchonete Doce Sabor',
    category: 'Lanchonete',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    rating: 4.5,
    reviews: 156,
    location: 'Jardins, São Paulo',
    price: 'R$ 20-40',
    tags: ['Promoção'],
  },
  {
    id: '3',
    name: 'Bar do Zé',
    category: 'Bar',
    image: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=400',
    rating: 4.6,
    reviews: 89,
    location: 'Vila Madalena, São Paulo',
    price: 'R$ 30-60',
    tags: ['Melhor Avaliado'],
  },
];

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Descubra os melhores
              <br />
              <span className="text-yellow-300">estabelecimentos</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Encontre restaurantes, lanchonetes, bares e muito mais
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Busque por nome, localização ou categoria..."
                  className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {['Todos', 'Restaurantes', 'Lanchonetes', 'Bares', 'Cafés'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category.toLowerCase() ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-6 py-2",
                    selectedCategory === category.toLowerCase() && "bg-yellow-400 text-gray-900"
                  )}
                  onClick={() => setSelectedCategory(category.toLowerCase())}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">1.2K+</div>
              <p className="text-gray-600">Estabelecimentos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">15K+</div>
              <p className="text-gray-600">Avaliações</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">4.8</div>
              <p className="text-gray-600">Avaliação Média</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">50+</div>
              <p className="text-gray-600">Cidades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Estabelecimentos em Destaque</h2>
            <p className="text-xl text-gray-600">Descubra os melhores lugares da sua cidade</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                {...space}
                onDetails={() => console.log('Ver detalhes:', space.name)}
                onSave={() => console.log('Salvar:', space.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para descobrir novos sabores?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a milhares de usuários que já encontram seus lugares favoritos
          </p>
          <Button size="lg" className="bg-white text-red-500 hover:bg-gray-100">
            Começar Agora
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;