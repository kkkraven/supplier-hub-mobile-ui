"use client";

import { CategoryPage } from "../../../components/pages/category-page";

interface CategoryPageProps {
  params: {
    categorySlug: string;
  };
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  return (
    <main>
      <CategoryPage categorySlug={params.categorySlug} />
    </main>
  );
}
