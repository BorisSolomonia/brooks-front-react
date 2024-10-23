import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Link } from '@mui/material';
import { styled } from '@mui/system';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // Import AuthContext only
import LoginForm from './components/LoginForm';
import Home from './Home';
import Features from './Features';
import Success from './Success';
import HomeProfile from './HomeProfile';
import SignUpForm from './components/SignUpForm'; // Import the SignUpForm component
import './App.css';

const Root = styled('div')({
  flexGrow: 1,
});

const Title = styled(Typography)({
  flexGrow: 1,
});

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(6),
}));

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleGetStarted = () => {
    navigate('/sign-up');
  };

  const handleLearnMore = () => {
    navigate('/features');
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  console.log('App component rendered');

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          <Title variant="h6">
            Brooks
          </Title>
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <main>
        <Routes>
          <Route path="/" element={<Home handleGetStarted={handleGetStarted} handleLearnMore={handleLearnMore} />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/sign-up" element={<SignUpForm />} /> {/* Add the SignUpForm route */}
          <Route path="/features" element={<Features />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/home_profile" element={<ProtectedRoute><HomeProfile /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer>
        <Typography variant="h6" align="center" gutterBottom>
          Brooks
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Connect, reflect, and explore.
        </Typography>
        <Link href="https://reactjs.org" color="inherit" variant="body2" align="center">
          Learn React
        </Link>
      </Footer>
    </Root>
  );
}

export default App;
