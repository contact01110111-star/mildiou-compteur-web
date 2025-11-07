export const metadata = {
  title: "Compteur de mildiou",
  description: "Analyse de feuilles de vigne - détection du mildiou",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="appwrap">
          {children}
        </div>
        <footer className="footer">Powered for Sausage </footer>
      </body>
    </html>
  );
}
