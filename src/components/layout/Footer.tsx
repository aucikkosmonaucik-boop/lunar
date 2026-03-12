import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Github, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-lunar-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-6 h-6 text-lunar-purple-light" />
              <span className="text-xl font-bold gradient-text">Lunar</span>
            </div>
            <p className="text-lunar-muted text-sm leading-relaxed">
              Odkryj wyjątkowe produkty w naszym kosmicznym sklepie. Jakość, której szukasz, ceny, które pokochasz.
            </p>
            <div className="flex gap-4 mt-5">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-lunar-muted hover:text-lunar-purple-light hover:bg-lunar-border transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-lunar-text mb-4 uppercase tracking-wider">Nawigacja</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Strona Główna' },
                { to: '/sklep', label: 'Sklep' },
                { to: '/koszyk', label: 'Koszyk' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-lunar-muted hover:text-lunar-purple-light text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-lunar-text mb-4 uppercase tracking-wider">Informacje</h3>
            <ul className="space-y-2">
              {['Regulamin', 'Polityka Prywatności', 'Zwroty i Reklamacje', 'Kontakt'].map(item => (
                <li key={item}>
                  <span className="text-lunar-muted hover:text-lunar-purple-light text-sm cursor-pointer transition-colors duration-200">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-lunar-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lunar-muted text-xs">
            © {new Date().getFullYear()} Lunar. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-lunar-muted">Bezpieczne płatności</span>
            <div className="flex gap-1">
              {['VISA', 'MC', 'BLIK'].map(card => (
                <span key={card} className="text-xs px-2 py-0.5 rounded border border-lunar-border text-lunar-muted">
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
