'use client';

import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar position="static">
      <Toolbar sx={{ padding: '0 16px' }}>
        <Typography variant="h1" component="div" sx={{ flexGrow: 1 }}>
          🍱
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            href="/"
            sx={{
              border: '1px solid rgba(255,255,255,0.3)',
              color: pathname === '/' ? '#fff' : 'rgba(255,255,255,0.7)',
              fontWeight: pathname === '/' ? 700 : 500,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              backgroundColor: pathname === '/' ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            >
            Order
          </Button>
          <Button
            component={Link}
            href="/history"
            sx={{
              border: '1px solid rgba(255,255,255,0.3)',
              color: pathname === '/history' ? '#fff' : 'rgba(255,255,255,0.7)',
              fontWeight: pathname === '/history' ? 700 : 500,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              backgroundColor: pathname === '/history' ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
