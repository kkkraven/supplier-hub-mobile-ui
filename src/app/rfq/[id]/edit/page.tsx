import { RFQEditPage } from "../../../../components/rfq/rfq-edit-page";

interface RFQEditProps {
  params: {
    id: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams() {
  return [];
}

export default function RFQEdit({ params }: RFQEditProps) {
  return (
    <main>
      <RFQEditPage rfqId={params.id} />
    </main>
  );
}
