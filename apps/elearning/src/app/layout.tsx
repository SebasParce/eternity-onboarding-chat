import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Academia de Creadores — Eternity Agency LATAM",
  description: "Capacitación de creadores TikTok LIVE — Eternity Agency LATAM",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
