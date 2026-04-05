// ---
// 📚 POR QUÉ: Root layout del dashboard web. Configura el HTML base, metadatos SEO,
//    fuentes, y estilos globales. Sin un layout raíz bien configurado, cada página
//    tendría que repetir head, meta tags y font loading — violando DRY.
// 📁 ARCHIVO: web/app/layout.tsx
// ---

import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export const metadata: Metadata = {
  title: 'EcoAgent — Plataforma de Riesgo Climático',
  description:
    'Monitoreo y simulación estocástica de riesgo de deslizamientos en tiempo real para Manizales, Colombia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
