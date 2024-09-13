// // src/components/SignUpForm.js
// import React, { useState, useContext } from 'react';
// import { Container, TextField, Button, Typography } from '@mui/material';
// import { styled } from '@mui/system';
// import { useNavigate } from 'react-router-dom';
// import { signUp } from '../services/authService';
// import { AuthContext } from '../context/AuthContext';
// import OAuthLogin from './OAuthLogin';

// const FormContainer = styled(Container)(({ theme }) => ({
//   marginTop: theme.spacing(8),
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
// }));


// const SignUpFormStyled = styled('form')(({ theme }) => ({
//   width: '100%', // Fix IE 11 issue.
//   marginTop: theme.spacing(1),
// }));

// function SignUpForm() {
//   const [userData, setUserData] = useState({ username: '', password: '' });
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({
//       ...userData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { token, user } = await signUp(userData);
//       login(token, user);
//       navigate('/home_profile');
//     } catch (error) {
//       console.error('Sign-up failed', error);
//     }
//   };

//   return (
//     <FormContainer component="main" maxWidth="xs">
//       <Typography component="h1" variant="h5">
//         Sign Up
//       </Typography>
//       <SignUpFormStyled onSubmit={handleSubmit}>
//         <TextField
//           variant="outlined"
//           margin="normal"
//           required
//           fullWidth
//           id="username"
//           label="Username"
//           name="username"
//           autoComplete="username"
//           autoFocus
//           value={userData.username}
//           onChange={handleChange}
//         />
//         <TextField
//           variant="outlined"
//           margin="normal"
//           required
//           fullWidth
//           name="password"
//           label="Password"
//           type="password"
//           id="password"
//           autoComplete="current-password"
//           value={userData.password}
//           onChange={handleChange}
//         />
//         <Button
//           type="submit"
//           fullWidth
//           variant="contained"
//           color="primary"
//         >
//           Sign Up
//         </Button>
//       </SignUpFormStyled>
//       <h3>Or sign up with</h3>
//       <OAuthLogin /> {/* Include OAuth login buttons */}
//     </FormContainer>
//   );
// }

// export default SignUpForm;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { signUp as signUpService } from '../services/authService'; // Importing sign-up service
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

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
  const { login } = useContext(AuthContext); // Use login method from AuthContext to store token
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

    try {
      const response = await signUpService({ username: userData.username, password: userData.password });
      console.log('Sign-up Response:', response); // Debugging line
      const { accessToken: token, user } = response; // Assuming the API returns a token and user data
      if (token) {
        login(token, user); // Save token and user in context
        navigate('/home_profile'); // Redirect to home/profile page after sign-up
      } else {
        console.error('No token received during sign-up');
      }
    } catch (error) {
      console.error('Sign-up failed:', error);
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Sign Up
        </Button>
      </SignUpFormStyled>
      <p>Already have an account? <Button onClick={() => navigate('/login')}>Login</Button></p>
    </FormContainer>
  );
};

export default SignUpForm;
