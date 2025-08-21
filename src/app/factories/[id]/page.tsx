"use client";
import { FactoryDetailPage } from "../../../components/pages/factory-detail-page";

interface FactoryDetailProps {
  params: {
    id: string;
  };
}

export default function FactoryDetail({ params }: FactoryDetailProps) {
  return (
    <main>
      <FactoryDetailPage factoryId={params.id} />
    </main>
  );
}
