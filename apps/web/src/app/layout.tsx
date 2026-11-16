import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Unravel',
  description: 'Follow the sequence behind browser bugs.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
