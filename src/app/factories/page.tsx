"use client";
import { Suspense } from "react";
import { FactoryListPage } from "../../components/pages/factory-list-page";

function FactoriesContent() {
  return (
    <main>
      <FactoryListPage />
    </main>
  );
}

export default function Factories() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <FactoriesContent />
    </Suspense>
  );
}
