// =============================================================================
// SÉLECTEUR DE LANGUE - COPIEZ CE COMPOSANT
// =============================================================================
// Un dropdown élégant pour changer de langue
// Usage: <LanguageSwitcher /> n'importe où dans votre app
// =============================================================================

import { useState } from 'react';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

const LanguageSwitcher = ({ variant = 'default', className }: LanguageSwitcherProps) => {
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelect = (code: string) => {
    setLanguage(code as typeof language);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'icon' : 'sm'}
          className={cn(
            'gap-2 font-medium',
            variant === 'compact' && 'w-9 h-9 p-0',
            className
          )}
        >
          {variant === 'compact' ? (
            <span className="text-base">{currentLanguage.flag}</span>
          ) : variant === 'full' ? (
            <>
              <span className="text-base">{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 max-h-80 overflow-y-auto"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'flex items-center justify-between gap-3 cursor-pointer',
              language === lang.code && 'bg-accent'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
