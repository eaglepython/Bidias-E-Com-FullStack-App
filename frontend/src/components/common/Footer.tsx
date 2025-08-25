import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              AI E-Commerce
            </Typography>
            <Typography variant="body2" color="grey.400">
              The future of online shopping with AI-powered recommendations
              and intelligent customer service.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                About Us
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
              <Link href="/support" color="inherit" underline="hover">
                Support
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" underline="hover">
                Help Center
              </Link>
              <Link href="/shipping" color="inherit" underline="hover">
                Shipping Info
              </Link>
              <Link href="/returns" color="inherit" underline="hover">
                Returns
              </Link>
              <Link href="/faq" color="inherit" underline="hover">
                FAQ
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Terms of Service
              </Link>
              <Link href="/cookies" color="inherit" underline="hover">
                Cookie Policy
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, bgcolor: 'grey.700' }} />
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} AI E-Commerce. All rights reserved.
          </Typography>
          <Typography variant="body2" color="grey.400">
            Powered by AI & Machine Learning
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
