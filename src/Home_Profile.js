import React, { useEffect, useRef, useState, useContext } from 'react';
import { Container, Typography, Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import { AuthContext } from './context/AuthContext';
import {jwtDecode} from 'jwt-decode'; // Fix the import statement

const HeroContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0, 6),
  backgroundImage: 'url(https://source.unsplash.com/random)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const MapContainer = styled(Container)(({ theme }) => ({
  height: '500px',
  width: '100%',
  marginTop: theme.spacing(8),
}));

const checkProximity = (lat1, lon1, lat2, lon2, distance) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= distance;
};

function HomeProfile() {
  const mapRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [placeDetails, setPlaceDetails] = useState({ name: '', lat: null, lng: null });
  const [places, setPlaces] = useState([]);
  const [dismissedPlaces, setDismissedPlaces] = useState(new Set());
  const [alertPlace, setAlertPlace] = useState(null);
  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    console.log('HomeProfile component mounted');

    const fetchPlaces = async () => {
      try {
        console.log('Token for fetching places:', token);
        //'https://places.brooks-dusura.uk/api/places'
        const response = await fetch('https://www.brooks-dusura.uk/api/places', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPlaces(data);
        console.log('Places loaded:', data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    let map;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        console.log(`Geolocation obtained: lat=${latitude}, lng=${longitude}`);

        map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });

        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: 'You are here!',
        });

        map.addListener('click', (e) => {
          setPlaceDetails({ name: '', lat: e.latLng.lat(), lng: e.latLng.lng() });
          setDialogOpen(true);
          console.log(`Map clicked at: lat=${e.latLng.lat()}, lng=${e.latLng.lng()}`);
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    if (token) {
      fetchPlaces();
    }

    return () => {
      console.log('HomeProfile component unmounted');
    };
  }, [token]);
  useEffect(() => {
    if (window.google && mapRef.current) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
  
        // Initialize the map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });
  
        // Add a marker to indicate the user's location
        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: 'You are here!',
        });
  
        // Log a message when the map is successfully initialized
        console.log("Google Map has been initialized successfully at coordinates:", latitude, longitude);
  
        // Add a click listener to the map
        map.addListener('click', (e) => {
          setPlaceDetails({ name: '', lat: e.latLng.lat(), lng: e.latLng.lng() });
          setDialogOpen(true);
          console.log(`Map clicked at: lat=${e.latLng.lat()}, lng=${e.latLng.lng()}`);
        });
      }, 
      (error) => {
        console.error("Error obtaining geolocation:", error);
      });
    } else {
      console.error('Google Maps JavaScript API failed to load');
    }
  }, []);
  

  const handleSavePlace = () => {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid token:', token);
      return;
    }

    console.log('Token:', token);

    try {
      const decodedToken = jwtDecode(token); // Decode the JWT token
      const username = decodedToken['user-name']; // Extract the username

      const placeDetailsWithUser = { ...placeDetails, username }; // Add username to place details

      console.log('Saving place:', placeDetailsWithUser);

      //fetch('https://places.brooks-dusura.uk/api/places', {
      fetch('https://www.brooks-dusura.uk/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the request
        },
        body: JSON.stringify(placeDetailsWithUser),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Place saved:', data);
          setPlaces([...places, data]);
          setDialogOpen(false);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const handleDismissAlert = () => {
    setDismissedPlaces(prev => new Set(prev.add(alertPlace.name)));
    setAlertPlace(null);
  };

  const handleTest = async () => {
    try {
      //const response = await fetch('https://places.brooks-dusura.uk/api/test', {
      const response = await fetch('https://www.brooks-dusura.uk/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      console.log('Test response:', data);
    } catch (error) {
      console.error('Test fetch error:', error);
    }
  };

  return (
    <div>
      <HeroContent>
        <Container maxWidth="sm">
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            Brooks
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
           Leave a Mark
          </Typography>
          <Button onClick={logout} color="inherit">
            Logout
          </Button>
        </Container>
      </HeroContent>
      <MapContainer>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
      </MapContainer>
      <Button onClick={handleTest} color="primary" variant="contained" style={{ margin: '20px' }}>
        Test
      </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Save Place</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Place Name"
            type="text"
            fullWidth
            value={placeDetails.name}
            onChange={(e) => setPlaceDetails({ ...placeDetails, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSavePlace} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {alertPlace && (
        <Dialog open={true} onClose={handleDismissAlert}>
          <DialogTitle>Proximity Alert</DialogTitle>
          <DialogContent>
            <Typography>You are close to {alertPlace.name}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDismissAlert} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default HomeProfile;


// import React, { useEffect, useRef, useState, useContext } from 'react';
// import { Container, Typography, Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
// import { styled } from '@mui/system';
// import { AuthContext } from './context/AuthContext';
// import jwtDecode from 'jwt-decode'; // Fix the import statement

// const HeroContent = styled(Box)(({ theme }) => ({
//   padding: theme.spacing(8, 0, 6),
//   backgroundImage: 'url(https://source.unsplash.com/random)',
//   backgroundSize: 'cover',
//   backgroundPosition: 'center',
// }));

// const MapContainer = styled(Container)(({ theme }) => ({
//   height: '500px',
//   width: '100%',
//   marginTop: theme.spacing(8),
// }));

// const checkProximity = (lat1, lon1, lat2, lon2, distance) => {
//   const toRad = (value) => (value * Math.PI) / 180;

//   const R = 6371; // km
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const lat1Rad = toRad(lat1);
//   const lat2Rad = toRad(lat2);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const d = R * c;
//   return d <= distance;
// };

// function HomeProfile() {
//   const mapRef = useRef(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [placeDetails, setPlaceDetails] = useState({ name: '', lat: null, lng: null });
//   const [places, setPlaces] = useState([]);
//   const [dismissedPlaces, setDismissedPlaces] = useState(new Set());
//   const [alertPlace, setAlertPlace] = useState(null);
//   const { token, logout } = useContext(AuthContext);

//   // State for interactive circles
//   const [duration, setDuration] = useState(10); // Duration value
//   const [distance, setDistance] = useState(50); // Distance value

//   useEffect(() => {
//     console.log('HomeProfile component mounted');

//     const fetchPlaces = async () => {
//       try {
//         console.log('Token for fetching places:', token);
//         const response = await fetch('https://places.brooks-dusura.uk/api/places', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           mode: 'cors',
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setPlaces(data);
//         console.log('Places loaded:', data);
//       } catch (error) {
//         console.error('Fetch error:', error);
//       }
//     };

//     let map;
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(position => {
//         const { latitude, longitude } = position.coords;
//         console.log(`Geolocation obtained: lat=${latitude}, lng=${longitude}`);

//         map = new window.google.maps.Map(mapRef.current, {
//           center: { lat: latitude, lng: longitude },
//           zoom: 12,
//         });

//         new window.google.maps.Marker({
//           position: { lat: latitude, lng: longitude },
//           map,
//           title: 'You are here!',
//         });

//         map.addListener('click', (e) => {
//           setPlaceDetails({ name: '', lat: e.latLng.lat(), lng: e.latLng.lng() });
//           setDialogOpen(true);
//           console.log(`Map clicked at: lat=${e.latLng.lat()}, lng=${e.latLng.lng()}`);
//         });
//       });
//     } else {
//       alert("Geolocation is not supported by this browser.");
//     }

//     if (token) {
//       fetchPlaces();
//     }

//     return () => {
//       console.log('HomeProfile component unmounted');
//     };
//   }, [token]);

//   const handleSavePlace = () => {
//     if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
//       console.error('Invalid token:', token);
//       return;
//     }

//     console.log('Token:', token);

//     try {
//       const decodedToken = jwtDecode(token); // Decode the JWT token
//       const username = decodedToken['user-name']; // Extract the username

//       const placeDetailsWithUser = { ...placeDetails, username, duration, distance }; // Add duration and distance to place details

//       console.log('Saving place:', placeDetailsWithUser);

//       fetch('https://places.brooks-dusura.uk/api/places', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`, // Include the token in the request
//         },
//         body: JSON.stringify(placeDetailsWithUser),
//       })
//         .then(response => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then(data => {
//           console.log('Place saved:', data);
//           setPlaces([...places, data]);
//           setDialogOpen(false);
//         })
//         .catch((error) => {
//           console.error('Error:', error);
//         });
//     } catch (error) {
//       console.error('Error decoding token:', error);
//     }
//   };

//   return (
//     <div>
//       <HeroContent>
//         <Container maxWidth="sm">
//           <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
//             Brooks
//           </Typography>
//           <Typography variant="h5" align="center" color="textSecondary" paragraph>
//            Leave a Mark
//           </Typography>
//           <Button onClick={logout} color="inherit">
//             Logout
//           </Button>
//         </Container>
//       </HeroContent>
//       <MapContainer>
//         <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
//       </MapContainer>

//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle>Save Place</DialogTitle>
//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="Place Name"
//             type="text"
//             fullWidth
//             value={placeDetails.name}
//             onChange={(e) => setPlaceDetails({ ...placeDetails, name: e.target.value })}
//           />

//           {/* Interactive Circles for Duration and Distance */}
//           <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
//             {/* Duration Circle */}
//             <div style={{ width: '100px' }}>
//               <CircularProgressbar
//                 value={duration}
//                 text={`${Math.round(duration)} min`}
//                 styles={buildStyles({
//                   pathColor: `rgba(62, 152, 199, ${duration / 100})`,
//                   textColor: '#000',
//                   trailColor: '#d6d6d6',
//                 })}
//               />
//               <Typography align="center">Duration</Typography>
//             </div>

//             {/* Distance Circle */}
//             <div style={{ width: '100px' }}>
//               <CircularProgressbar
//                 value={distance}
//                 text={`${Math.round(distance)} m`}
//                 styles={buildStyles({
//                   pathColor: `rgba(62, 199, 152, ${distance / 100})`,
//                   textColor: '#000',
//                   trailColor: '#d6d6d6',
//                 })}
//               />
//               <Typography align="center">Distance</Typography>
//             </div>
//           </div>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={handleSavePlace} color="primary">
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {alertPlace && (
//         <Dialog open={true} onClose={() => setAlertPlace(null)}>
//           <DialogTitle>Proximity Alert</DialogTitle>
//           <DialogContent>
//             <Typography>You are close to {alertPlace.name}</Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setAlertPlace(null)} color="primary">
//               OK
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// }

// export default HomeProfile;

