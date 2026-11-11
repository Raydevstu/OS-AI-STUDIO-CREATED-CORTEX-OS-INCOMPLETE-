import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'CortexOS | AI-Native Operating System',
  description: 'AI-native operating system for building software with Jarvis Supervisor, Chief Librarian, Phase Studios, and War Room.',
  openGraph: {
    title: 'CortexOS | AI-Native Operating System',
    description: 'AI-native operating system for building software with Jarvis Supervisor, Chief Librarian, Phase Studios, and War Room.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CortexOS | AI-Native Operating System',
    description: 'AI-native operating system for building software with Jarvis Supervisor, Chief Librarian, Phase Studios, and War Room.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
