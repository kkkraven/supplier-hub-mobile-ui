import { CategoryPage } from "../../../components/pages/category-page";

interface CategoryPageProps {
  params: {
    categorySlug: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams(): Promise<Array<{ categorySlug: string }>> {
  return [];
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  return (
    <main>
      <CategoryPage categorySlug={params.categorySlug} />
    </main>
  );
}
