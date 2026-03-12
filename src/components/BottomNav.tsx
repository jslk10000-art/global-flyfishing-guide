import { Home, MapPin, Bug, Users, Bookmark, BookOpen, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/lakes', label: 'Lakes', icon: MapPin },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/recommendations', label: 'Flies', icon: Bug },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/my-spots', label: 'Spots', icon: Bookmark },
    { href: '/log', label: 'Log', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${
              isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
