
export const metadata = {
  title: 'Alight Motion Premium Generator',
  description: 'Sistem Distribusi Otomatis Lisensi Akun Premium AM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

