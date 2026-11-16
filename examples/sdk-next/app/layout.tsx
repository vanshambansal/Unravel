import '../src/style.css';
export const metadata = { title: 'Next.js SDK manual test' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
