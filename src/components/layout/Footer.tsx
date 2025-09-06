import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Encontre Aqui</h3>
            <p className="text-gray-400 mb-4">
              Descubra os melhores estabelecimentos da sua cidade com facilidade e segurança.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/restaurantes" className="hover:text-red-500 transition-colors">Restaurantes</Link></li>
              <li><Link to="/lanchonetes" className="hover:text-red-500 transition-colors">Lanchonetes</Link></li>
              <li><Link to="/bares" className="hover:text-red-500 transition-colors">Bares</Link></li>
              <li><Link to="/cafes" className="hover:text-red-500 transition-colors">Cafés</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/ajuda" className="hover:text-red-500 transition-colors">Ajuda</Link></li>
              <li><Link to="/faq" className="hover:text-red-500 transition-colors">FAQ</Link></li>
              <li><Link to="/contato" className="hover:text-red-500 transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contato@encontreaqui.com.br</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Encontre Aqui. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;