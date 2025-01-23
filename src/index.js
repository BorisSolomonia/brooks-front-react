import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

const theme = createTheme({
  palette: {
    background: {
      paper: '#ffffff',
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider> {/* Wrap your app with AuthProvider */}
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);
