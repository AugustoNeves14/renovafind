import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Encontre Aqui</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/restaurantes" className="text-gray-700 hover:text-red-500 transition-colors">
              Restaurantes
            </Link>
            <Link to="/lanchonetes" className="text-gray-700 hover:text-red-500 transition-colors">
              Lanchonetes
            </Link>
            <Link to="/bares" className="text-gray-700 hover:text-red-500 transition-colors">
              Bares
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button className="hidden md:flex">Entrar</Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg",
        isMenuOpen ? "block" : "hidden"
      )}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          <Link to="/restaurantes" className="block py-2">Restaurantes</Link>
          <Link to="/lanchonetes" className="block py-2">Lanchonetes</Link>
          <Link to="/bares" className="block py-2">Bares</Link>
          <Button className="w-full">Entrar</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;