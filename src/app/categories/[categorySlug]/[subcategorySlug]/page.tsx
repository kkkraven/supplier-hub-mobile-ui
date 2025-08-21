import { SubcategoryPage } from "../../../../components/pages/subcategory-page";

interface SubcategoryPageProps {
  params: {
    categorySlug: string;
    subcategorySlug: string;
  };
}

// Генерируем статические параметры для экспорта
export async function generateStaticParams(): Promise<Array<{ categorySlug: string; subcategorySlug: string }>> {
  return [
    { categorySlug: 'electronics', subcategorySlug: 'smartphones' },
    { categorySlug: 'electronics', subcategorySlug: 'laptops' },
    { categorySlug: 'clothing', subcategorySlug: 'shirts' },
    { categorySlug: 'clothing', subcategorySlug: 'pants' }
  ];
}

export default function SubcategoryPageRoute({ params }: SubcategoryPageProps) {
  return (
    <main>
      <SubcategoryPage 
        categorySlug={params.categorySlug} 
        subcategorySlug={params.subcategorySlug} 
      />
    </main>
  );
}
