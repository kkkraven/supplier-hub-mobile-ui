import { RFQEditPage } from "../../../../components/rfq/rfq-edit-page";

interface RFQEditProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export default function RFQEditPage({ params }: RFQEditProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Редактирование RFQ #{params.id}</h1>
      <p>Страница редактирования запроса на предложение</p>
    </div>
  );
}
