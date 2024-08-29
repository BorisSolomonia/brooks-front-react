import React from 'react';
import { Container, Grid, Button, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const HeroContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0, 6),
  backgroundImage: 'url(https://source.unsplash.com/random)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const HeroButtons = styled(Box)({
  marginTop: 4,
});

function Home({ handleGetStarted, handleLearnMore }) {
  return (
    <HeroContent>
      <Container maxWidth="sm">
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          ზდაროვა დოჯიკი
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Share your personal notes, thoughts, and experiences at specific locations. Connect with others through shared memories and insights.
        </Typography>
        <HeroButtons>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleGetStarted}>
                Get Started
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={handleLearnMore}>
                Learn More
              </Button>
            </Grid>
          </Grid>
        </HeroButtons>
      </Container>
    </HeroContent>
  );
}

export default Home;
