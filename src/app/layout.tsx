import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/state";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Comunidad — carpooling de confianza",
  description: "Comparte trayectos con gente de tu urbanización, empresa o colegio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
        <div id="toast-host" />
      </body>
    </html>
  );
}
