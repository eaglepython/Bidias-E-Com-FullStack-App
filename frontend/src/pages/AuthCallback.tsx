import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('OAuth authentication failed:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token && refreshToken) {
      try {
        // Decode user info from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const userData = {
          id: payload.id,
          email: payload.email,
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          role: payload.role || 'customer'
        };

        // Store tokens and user data
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        dispatch(login({
          user: userData,
          token
        }));

        // Redirect to dashboard or home
        navigate('/', { 
          state: { 
            message: `Successfully signed in with ${provider}!` 
          } 
        });
      } catch (error) {
        console.error('Failed to process OAuth tokens:', error);
        navigate('/login?error=token_processing_failed');
      }
    } else {
      console.error('Missing OAuth tokens');
      navigate('/login?error=missing_tokens');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        Completing Authentication...
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Please wait while we log you in.
      </Typography>
    </Box>
  );
};

export default AuthCallback;
