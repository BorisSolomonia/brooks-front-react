import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { login as loginService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import OAuthLogin from './OAuthLogin'; // Import the OAuthLogin component

const FormContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#f9f9f9', // Subtle background color
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const LoginFormStyled = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false); // Loading state for spinner
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start the loading spinner

        try {
            const response = await loginService(credentials);
            console.log('Response from loginService:', response); // Debugging line
            const { accessToken: token, user } = response;
            if (token) {
                login(token, user);
                console.log('Logged in successfully, JWT token:', token); // Log the token here
                navigate('/home_profile');
            } else {
                console.error('No token received');
            }
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setLoading(false); // Stop the loading spinner after the request is done
        }
    };

    return (
        <FormContainer component="main" maxWidth="xs">
          <Typography component="h1" variant="h5" style={{ color: '#333', fontWeight: 'bold' }}>
            Login
          </Typography>
          <LoginFormStyled onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              InputProps={{ style: { borderRadius: 8 } }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              InputProps={{ style: { borderRadius: 8 } }}
            />

            {/* Conditionally show spinner or Login button */}
            <div style={{ position: 'relative', marginTop: '16px' }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading} // Disable button while loading
                style={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  padding: '10px 0',
                  borderRadius: 8,
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              {/* Loading Spinner */}
              {loading && (
                <CircularProgress
                  size={24}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: -12,
                    marginLeft: -12,
                  }}
                />
              )}
            </div>
          </LoginFormStyled>

          <Typography variant="body2" style={{ marginTop: '16px', color: '#666' }}>
            Or login with
          </Typography>
          <OAuthLogin /> {/* Include OAuth login buttons */}

          <Typography variant="body2" style={{ marginTop: '16px', color: '#666' }}>
            Not registered yet?{' '}
            <Button onClick={() => navigate('/sign-up')} style={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Up
            </Button>
          </Typography>
        </FormContainer>
    );
};

export default LoginForm;
