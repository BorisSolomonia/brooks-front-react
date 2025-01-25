import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { signUp, getToken } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const FormContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const SignUpFormStyled = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SignUpForm = () => {
  const [userData, setUserData] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); // Use login method to store token
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password !== userData.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign up the user (this just creates the user in the DB, no token is returned)
      const signUpResponse = await signUp({
        username: userData.username,
        password: userData.password
      });
      console.log('Sign-up Response (no token expected):', signUpResponse);

      // Step 2: Call auth server to get the token (assuming it needs username/password)
      const tokenResponse = await getToken({
        username: userData.username,
        password: userData.password
      });
      console.log('Token Response:', tokenResponse);

      // Step 3: Extract the token, store in AuthContext
      const { access_token, accessToken, user } = tokenResponse;
      // adapt to whatever your token field is named
      const token = access_token || accessToken;
      
      if (token) {
        // Store token and (optionally) user details in context
        login(token, user);
        navigate('/home_profile');
      } else {
        console.error('No token received from auth server');
      }
    } catch (error) {
      console.error('Sign-up or token retrieval failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer component="main" maxWidth="xs">
      <Typography component="h1" variant="h5">
        Sign Up
      </Typography>
      <SignUpFormStyled onSubmit={handleSubmit}>
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
          value={userData.username}
          onChange={handleChange}
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
          autoComplete="new-password"
          value={userData.password}
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={userData.confirmPassword}
          onChange={handleChange}
        />
        
        <div style={{ position: 'relative' }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
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
      </SignUpFormStyled>
      
      <p>Already have an account? <Button onClick={() => navigate('/login')}>Login</Button></p>
    </FormContainer>
  );
};

export default SignUpForm;
