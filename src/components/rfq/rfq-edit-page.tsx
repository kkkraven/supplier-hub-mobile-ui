"use client";

import React from 'react';

interface RFQEditPageProps {
  rfqId: string;
}

export function RFQEditPage({ rfqId }: RFQEditPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Редактирование RFQ
        </h1>
        <p className="text-gray-600">
          RFQ ID: {rfqId}
        </p>
        <div className="mt-8 p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">
            Функция редактирования RFQ будет доступна в полной версии
          </p>
        </div>
      </div>
    </div>
  );
}
