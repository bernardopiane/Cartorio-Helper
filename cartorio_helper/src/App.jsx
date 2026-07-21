import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRouter from './routes';

const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5', light: '#eef2ff', dark: '#4338ca' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f8f9fc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: '#94a3b8' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', borderRadius: 12 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableHead-root .MuiTableCell-head': { fontWeight: 600, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
          '& .MuiTableCell-root': { fontSize: '0.8125rem', borderColor: '#f1f5f9' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}
