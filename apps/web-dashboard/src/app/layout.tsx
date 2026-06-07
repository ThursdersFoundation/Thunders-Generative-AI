import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Thunders GenerativeAI Dashboard',
    template: '%s | Thunders GenerativeAI',
  },
  description: 'Manage and monitor your AI models, conversations, and analytics with Thunders GenerativeAI platform.',
  keywords: ['AI', 'Generative AI', 'Dashboard', 'Thunders', 'Machine Learning', 'LLM'],
  authors: [{ name: 'Thunders AI Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Thunders GenerativeAI',
    title: 'Thunders GenerativeAI Dashboard',
    description: 'Manage and monitor your AI models, conversations, and analytics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thunders GenerativeAI Dashboard',
    description: 'Manage and monitor your AI models, conversations, and analytics.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <div className="relative min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
