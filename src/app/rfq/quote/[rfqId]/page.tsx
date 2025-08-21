import { QuoteFormWrapper } from "../../../../components/rfq/quote-form-wrapper";

interface QuotePageProps {
  params: {
    rfqId: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams(): Promise<Array<{ rfqId: string }>> {
  return [];
}

export default function QuotePageRoute({ params }: QuotePageProps) {
  return (
    <main>
      <QuoteFormWrapper rfqId={params.rfqId} />
    </main>
  );
}
