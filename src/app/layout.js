import "./globals.css";

export const metadata = {
  title: "Flowra   Agentic Agile Orchestration & Performance Verification",
  description: "Flowra is an intelligent orchestration platform that eliminates manual Agile management friction through AI-powered synchronization. SE Project   Group 3, Section C.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
