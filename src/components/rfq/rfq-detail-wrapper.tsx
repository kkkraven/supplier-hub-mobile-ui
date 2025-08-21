"use client";

import { RFQDetail } from "./rfq-detail";

interface RFQDetailWrapperProps {
  rfqId: string;
}

export function RFQDetailWrapper({ rfqId }: RFQDetailWrapperProps) {
  // Здесь нужно будет загрузить RFQ данные
  // Пока используем заглушку
  const mockRFQ = {
    id: rfqId,
    title: "Загрузка...",
    description: "Загрузка...",
    quantity: 0,
    deadline: new Date(),
    priority: "normal",
    status: "draft",
    category_id: "1",
    created_at: new Date(),
    updated_at: new Date()
  };

  return (
    <RFQDetail rfq={mockRFQ as any} />
  );
}
