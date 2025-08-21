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

export default function RFQEditPage() {
  return (
    <div>
      <h1>RFQ Edit Page</h1>
    </div>
  );
}
