import { RFQSendPage } from "../../../../components/rfq/rfq-send-page";

interface RFQSendProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  return [];
}

export default function RFQSendPage() {
  return (
    <div>
      <h1>RFQ Send Page</h1>
    </div>
  );
}
