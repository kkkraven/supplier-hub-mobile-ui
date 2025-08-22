// ============================================================================
// ACCOUNT PAGE
// ============================================================================
// Страница управления аккаунтом и подпиской пользователя
// ============================================================================

import { Metadata } from 'next';
import { AccountPageComponent } from '@/components/pages/account-page';

export const metadata: Metadata = {
  title: 'Мой аккаунт | Supplier Hub',
  description: 'Управление подпиской, лимитами и настройками аккаунта',
};

export default function AccountPage() {
  return <AccountPageComponent />;
}
