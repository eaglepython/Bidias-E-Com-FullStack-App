import React from 'react';
import { Typography, Box } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Typography>
        User profile management, order history, and preferences will be implemented here.
      </Typography>
    </Box>
  );
};

export default ProfilePage;
