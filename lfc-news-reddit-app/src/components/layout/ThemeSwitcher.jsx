/**
 * Theme switcher for Liverpool FC colour schemes (red, white, black).
 * Uses ShadCN ToggleGroup with colour swatches — pick your kit for match day.
 * Persists selection to localStorage and applies via data-theme attribute.
 */

import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'red', name: 'Anfield Red', shortName: 'Home', color: '#D00027', description: 'Home Kit' },
  { id: 'white', name: 'Away Day', shortName: 'Away', color: '#f5f0e8', description: 'Away Kit' },
  { id: 'black', name: 'Third Kit', shortName: 'Third', color: '#000000', description: 'Third Kit' },
];

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('lfc-theme') || 'red';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (value) => {
    // ToggleGroup returns empty string when clicking the already-active item
    if (!value) return;
    setCurrentTheme(value);
    localStorage.setItem('lfc-theme', value);
  };

  return (
    <div
      data-testid="theme-switcher"
      className="flex items-center gap-2"
      role="group"
      aria-label="Theme selection"
    >
      <Palette className="size-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
      <ToggleGroup
        type="single"
        value={currentTheme}
        onValueChange={handleThemeChange}
        className="gap-1"
      >
        {themes.map((theme) => (
          <ToggleGroupItem
            key={theme.id}
            value={theme.id}
            aria-label={`${theme.name} theme`}
            title={theme.description}
            className={cn(
              'relative h-8 px-2 gap-1.5 text-xs font-medium transition-all',
              'data-[state=on]:ring-2 data-[state=on]:ring-ring data-[state=on]:ring-offset-1 data-[state=on]:ring-offset-background',
            )}
          >
            <span
              className={cn(
                'size-3.5 rounded-full shrink-0 shadow-inner',
                theme.id === 'white' && 'border border-muted-foreground/30',
                theme.id === 'black' && 'border border-muted-foreground/20',
              )}
              style={{ backgroundColor: theme.color }}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{theme.shortName}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default React.memo(ThemeSwitcher);
