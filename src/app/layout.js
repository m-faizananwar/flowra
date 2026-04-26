import "./globals.css";

export const metadata = {
  title: "Flowra — AI-Powered Agile Orchestration Platform",
  description: "Flowra automates your entire Agile workflow. AI agents monitor commits, PRs, and team chat to keep Jira perfectly synced — so your team can focus on building.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'rgba(23, 24, 28, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              borderRadius: '1rem',
              fontFamily: "'Inter', sans-serif",
            },
          }} 
        />
        {children}
      </body>
    </html>
  );
}
