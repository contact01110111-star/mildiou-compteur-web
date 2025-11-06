export const metadata = {
  title: "Compteur de mildiou",
  description: "Analyse de feuilles de vigne - détection du mildiou",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          backgroundColor: "#0b1320",
          color: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <main style={{ flex: 1, padding: "20px" }}>{children}</main>

        {/* ✅ Footer vert stylé */}
        <footer
          style={{
            backgroundColor: "#22c55e",
            color: "#0b1320",
            textAlign: "center",
            padding: "10px 0",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          Powered for Sausage 🌿
        </footer>
      </body>
    </html>
  );
}
