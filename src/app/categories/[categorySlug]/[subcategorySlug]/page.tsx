import { SubcategoryPage } from '../../../../components/pages/subcategory-page';

interface SubcategoryPageProps {
  params: {
    categorySlug: string;
    subcategorySlug: string;
  };
}

export default function SubcategoryPageRoute({ params }: SubcategoryPageProps) {
  return (
    <SubcategoryPage 
      categorySlug={params.categorySlug} 
      subcategorySlug={params.subcategorySlug} 
    />
  );
}
