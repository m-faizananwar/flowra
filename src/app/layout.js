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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
