import { RFQDetailWrapper } from "../../../components/rfq/rfq-detail-wrapper";

interface RFQDetailProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function RFQDetail({ params }: RFQDetailProps) {
  return (
    <main>
      <RFQDetailWrapper rfqId={params.id} />
    </main>
  );
}
