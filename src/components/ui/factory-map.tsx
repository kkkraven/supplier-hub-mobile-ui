'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface FactoryMapProps {
  lat?: number;
  lng?: number;
  city: string;
  province?: string;
  className?: string;
}

export function FactoryMap({ lat, lng, city, province, className = '' }: FactoryMapProps) {
  // Если есть координаты, используем статичную карту OpenStreetMap
  if (lat && lng) {
    return (
      <div className={`aspect-video bg-gray-200 rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  // Если нет координат, показываем заглушку
  return (
    <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 mb-1">Карта недоступна</p>
        <p className="text-sm text-gray-500">
          {city}{province ? `, ${province}` : ''}, Китай
        </p>
      </div>
    </div>
  );
}

// Альтернативный компонент с использованием Google Maps (требует API ключ)
interface GoogleMapProps {
  lat?: number;
  lng?: number;
  city: string;
  province?: string;
  className?: string;
  apiKey?: string;
}

export function GoogleMap({ lat, lng, city, province, className = '', apiKey }: GoogleMapProps) {
  if (!apiKey) {
    return <FactoryMap lat={lat} lng={lng} city={city} province={province} className={className} />;
  }

  if (lat && lng) {
    return (
      <div className={`aspect-video bg-gray-200 rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return <FactoryMap lat={lat} lng={lng} city={city} province={province} className={className} />;
}
