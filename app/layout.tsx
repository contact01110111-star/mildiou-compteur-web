export const metadata = {
  title: "Compteur de mildiou",
  description: "Analyse automatique de feuilles de vigne pour détecter le mildiou"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "sans-serif", backgroundColor: "#0b1320", color: "#e5e7eb" }}>
        {children}
      </body>
    </html>
  );
}

