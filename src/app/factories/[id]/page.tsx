import { FactoryDetailPage } from "../../../components/pages/factory-detail-page";

interface FactoryDetailProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function FactoryDetail({ params }: FactoryDetailProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Фабрика #{params.id}</h1>
      <p>Детальная информация о фабрике</p>
    </div>
  );
}
