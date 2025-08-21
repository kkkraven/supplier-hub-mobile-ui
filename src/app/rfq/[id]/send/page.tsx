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

export default function RFQSend({ params }: RFQSendProps) {
  return (
    <main>
      <RFQSendPage rfqId={params.id} />
    </main>
  );
}
