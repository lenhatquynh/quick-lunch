import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeRegistry } from './providers/ThemeRegistry';
import Navbar from './components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quick Lunch - Đặt cơm trưa',
  description: 'Ứng dụng đặt cơm trưa không cần đăng nhập',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>
          <ThemeRegistry>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              {children}
            </Box>
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
