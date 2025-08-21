import { RFQSendPage } from "../../../../components/rfq/rfq-send-page";

interface RFQSendProps {
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

export default function RFQSendPage({ params }: RFQSendProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Отправка RFQ #{params.id}</h1>
      <p>Страница отправки запроса на предложение</p>
    </div>
  );
}
