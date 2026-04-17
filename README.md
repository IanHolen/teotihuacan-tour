# Guia Teotihuacan

Guia interactiva para recorrer las piramides de Teotihuacan. Mapa con GPS en tiempo real, rutas personalizadas por tiempo y audio guias en 3 idiomas.

## Caracteristicas

- Mapa interactivo con tu ubicacion GPS en tiempo real
- Rutas optimizadas segun tu tiempo disponible (1h, 2h, 3h, dia completo)
- Audio guias en espanol, portugues e ingles
- Navegacion guiada entre puntos de interes
- Funciona offline (PWA) - ideal para zonas con poca senal
- Diseno mobile-first para usar en el sitio arqueologico

## Tech Stack

- **Next.js 15** - App Router con export estatico
- **TypeScript** - Tipado fuerte
- **Tailwind CSS v4** - Estilos mobile-first
- **Leaflet + react-leaflet** - Mapas interactivos
- **PWA** - Soporte offline

## Inicio rapido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```
src/
  app/          - Paginas (Next.js App Router)
  components/   - Componentes React
  context/      - Providers (Language, Navigation)
  hooks/        - Custom hooks (geolocation, audio, proximity)
  lib/          - Utilidades (geo, constants)
  types/        - TypeScript interfaces
public/
  audio/        - Archivos de audio por idioma (es/pt/en)
  data/         - JSON de POIs, rutas e i18n
  icons/        - Iconos PWA
```

## Licencia

MIT
