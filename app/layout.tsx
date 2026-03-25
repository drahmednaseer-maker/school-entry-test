import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "SnapTest | Mardan Youth's Academy",
    template: "%s | SnapTest - MYA",
  },
  description: "The premier computerized entry test system and question bank management platform for Mardan Youth's Academy. Secure, transparent, and efficient student evaluation.",
  keywords: ["Mardan Youth's Academy", "Entry Test", "Student Evaluation", "Computerized Testing", "Education", "MYA", "SnapTest"],
  authors: [{ name: "Mardan Youth's Academy" }],
  creator: "Mardan Youth's Academy",
  publisher: "Mardan Youth's Academy",
  openGraph: {
    type: "website",
    locale: "en_PK",
    title: "SnapTest - Mardan Youth's Academy Entry Test System",
    description: "The premier computerized entry test system and question bank management platform for Mardan Youth's Academy.",
    siteName: "SnapTest",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapTest - Mardan Youth's Academy",
    description: "The premier computerized entry test system and question bank management platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Suppress theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('snaptest-theme');if(t==='dark'){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notNastaliqUrdu.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
