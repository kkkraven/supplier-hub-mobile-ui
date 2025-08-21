"use client";

import { QuoteForm } from "./quote-form";

interface QuoteFormWrapperProps {
  rfqId: string;
}

export function QuoteFormWrapper({ rfqId }: QuoteFormWrapperProps) {
  // Здесь нужно будет загрузить RFQ данные
  // Пока используем заглушку
  const mockRFQ = {
    id: rfqId,
    title: "Загрузка...",
    description: "Загрузка...",
    quantity: 0,
    deadline: new Date(),
    priority: "normal"
  };

  const handleSubmit = async (quoteData: any) => {
    console.log('Quote submitted:', quoteData);
  };

  return (
    <QuoteForm 
      rfq={mockRFQ as any}
      factoryId="mock-factory-id"
      onSubmit={handleSubmit}
    />
  );
}
