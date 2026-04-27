'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import creditsData from '../../../public/data/credits.json';
import poisData from '../../../public/data/pois.json';
import type { PointOfInterest } from '@/types';

interface Credit {
  poiSlug: string;
  image: string;
  author: string;
  license: string;
  source: string;
}

interface GalleryImage {
  src: string;
  alt: string;
  author: string;
  license: string;
}

interface PoiWithGallery extends PointOfInterest {
  gallery?: GalleryImage[];
}

const credits = creditsData as Credit[];
const pois = poisData as PoiWithGallery[];
const poiMap = new Map(pois.map((p) => [p.slug, p]));

export default function CreditsPage() {
  const router = useRouter();
  const { language } = useLanguage();

  // Collect all credits: main images + gallery images
  const allCredits = useMemo(() => {
    const items: Array<{ poiName: string; image: string; author: string; license: string; source?: string; alt?: string }> = [];

    // Main POI images from credits.json
    for (const credit of credits) {
      const poi = poiMap.get(credit.poiSlug);
      items.push({
        poiName: poi?.name[language] ?? credit.poiSlug,
        image: credit.image,
        author: credit.author,
        license: credit.license,
        source: credit.source,
      });
    }

    // Gallery images from pois.json
    for (const poi of pois) {
      if (poi.gallery) {
        for (const img of poi.gallery) {
          items.push({
            poiName: poi.name[language],
            image: img.src,
            author: img.author,
            license: img.license,
            alt: img.alt,
          });
        }
      }
    }

    return items;
  }, [language]);

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#232342]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#16213e]/80 border border-white/10 flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {language === 'es'
            ? 'Créditos de imágenes'
            : language === 'pt'
              ? 'Créditos de imagens'
              : 'Image Credits'}
        </h1>
        <p className="text-sm text-white/60 leading-relaxed">
          {language === 'es'
            ? 'Todas las imágenes utilizadas en esta aplicación provienen de Wikimedia Commons y son distribuidas bajo licencias Creative Commons.'
            : language === 'pt'
              ? 'Todas as imagens utilizadas neste aplicativo são provenientes do Wikimedia Commons e distribuídas sob licenças Creative Commons.'
              : 'All images used in this application are sourced from Wikimedia Commons and distributed under Creative Commons licenses.'}
        </p>
      </div>

      {/* Credits list */}
      <div className="px-5 pb-8">
        <div className="flex flex-col gap-3">
          {allCredits.map((credit, i) => (
            <div
              key={`${credit.image}-${i}`}
              className="rounded-xl bg-[#16213e] border border-white/10 overflow-hidden"
            >
              <div className="flex gap-3 p-3">
                <img
                  src={credit.image}
                  alt={credit.alt ?? credit.poiName}
                  className="flex-shrink-0 w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {credit.poiName}
                  </p>
                  {credit.alt && (
                    <p className="text-[10px] text-white/40 truncate">{credit.alt}</p>
                  )}
                  <p className="text-xs text-white/60 mt-0.5">
                    {language === 'es' ? 'Autor' : language === 'pt' ? 'Autor' : 'Author'}: {credit.author}
                  </p>
                  <p className="text-xs text-[#c4956a] mt-0.5">
                    {credit.license}
                  </p>
                  {credit.source && (
                    <a
                      href={credit.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/40 hover:text-white/60 underline mt-1 inline-block truncate max-w-full"
                    >
                      {language === 'es' ? 'Ver fuente' : language === 'pt' ? 'Ver fonte' : 'View source'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
