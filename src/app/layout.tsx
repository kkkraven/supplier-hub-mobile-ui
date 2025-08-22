import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "sonner";
import { MobileLayout } from "../components/ui/mobile-layout";

// Шрифты по брендбуку уже настроены в globals.css; удаляем Next Fonts

export const metadata: Metadata = {
  title: "Factura Supplier Hub",
  description: "Платформа поиска проверенных швейных фабрик Китая",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar
            currentPage={"landing"}
            showAdminButton={false}
          />
          <MobileLayout>
            {children}
          </MobileLayout>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
