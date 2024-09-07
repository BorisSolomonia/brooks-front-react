// src/components/SignUpForm.js
import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import OAuthLogin from './OAuthLogin';

const FormContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));


const SignUpFormStyled = styled('form')(({ theme }) => ({
  width: '100%', // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

function SignUpForm() {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await signUp(userData);
      login(token, user);
      navigate('/home_profile');
    } catch (error) {
      console.error('Sign-up failed', error);
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
          autoComplete="current-password"
          value={userData.password}
          onChange={handleChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Sign Up
        </Button>
      </SignUpFormStyled>
      <h3>Or sign up with</h3>
      <OAuthLogin /> {/* Include OAuth login buttons */}
    </FormContainer>
  );
}

export default SignUpForm;
