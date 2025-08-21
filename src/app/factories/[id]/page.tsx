import { FactoryDetailPage } from "../../../components/pages/factory-detail-page";

interface FactoryDetailProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  return [];
}

export default function FactoryDetail() {
  return (
    <div>
      <h1>Factory Detail Page</h1>
    </div>
  );
}
