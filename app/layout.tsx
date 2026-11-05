import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Prompt Chains",
  description: "Build, order, and test the prompt chains behind Caption This",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The boot script may set data-theme before React hydrates.
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="p-6">{children}</div>
      </body>
    </html>
  );
}
