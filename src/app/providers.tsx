'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { NavigationProvider } from '@/context/NavigationContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <NavigationProvider>{children}</NavigationProvider>
    </LanguageProvider>
  );
}
