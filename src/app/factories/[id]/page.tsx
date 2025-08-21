import { FactoryDetailPage } from "../../../components/pages/factory-detail-page";

interface FactoryDetailProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  // Возвращаем пустой массив, так как мы не знаем все ID заранее
  // В реальном проекте здесь можно было бы получить список всех фабрик
  return [];
}

export default function FactoryDetail({ params }: FactoryDetailProps) {
  return (
    <main>
      <FactoryDetailPage factoryId={params.id} />
    </main>
  );
}
