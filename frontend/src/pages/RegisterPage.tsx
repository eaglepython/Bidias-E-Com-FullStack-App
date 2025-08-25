import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Grid,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Person,
  Phone,
  LocationOn,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  ShoppingBag
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  zipCode: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  agreeToTerms?: string;
}

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    zipCode: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Zip Code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make an API call to register the user
      console.log('Registration data:', formData);
      
      setRegistrationSuccess(true);
      
      // Simulate successful registration
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Registration successful! Please log in with your credentials.' }
        });
      }, 2000);

    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ email: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    if (provider === 'Google') {
      window.location.href = 'http://localhost:4000/auth/google';
    } else if (provider === 'Facebook') {
      window.location.href = 'http://localhost:4000/auth/facebook';
    }
  };

  if (registrationSuccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={8} sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="primary">
              Welcome to Bidias E-Com!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your account has been created successfully. You'll be redirected to the login page shortly.
            </Typography>
            <CircularProgress size={24} />
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper elevation={8} sx={{ overflow: 'hidden' }}>
          <Grid container>
            {/* Left side - Welcome section */}
            {!isMobile && (
              <Grid item md={5}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <ShoppingBag sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h4" gutterBottom>
                    Join Bidias E-Com
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Create your account and discover amazing products across electronics, kitchen, living room, and sports categories.
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    • AI-powered shopping with Nate
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    • 70+ premium products
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    • Smart recommendations
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    • Secure shopping experience
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Right side - Registration form */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Create Account
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  textAlign="center" 
                  sx={{ mb: 3 }}
                >
                  Join our community and start shopping with AI-powered recommendations
                </Typography>

                {/* Social Registration Buttons */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleSocialRegister('Google')}
                    sx={{ mb: 1, textTransform: 'none' }}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FacebookIcon />}
                    onClick={() => handleSocialRegister('Facebook')}
                    sx={{ textTransform: 'none' }}
                  >
                    Continue with Facebook
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or register with email
                  </Typography>
                </Divider>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={formData.address}
                        onChange={handleInputChange('address')}
                        error={!!errors.address}
                        helperText={errors.address}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={handleInputChange('city')}
                        error={!!errors.city}
                        helperText={errors.city}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Zip Code"
                        value={formData.zipCode}
                        onChange={handleInputChange('zipCode')}
                        error={!!errors.zipCode}
                        helperText={errors.zipCode}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange('agreeToTerms')}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link component={RouterLink} to="/terms" color="primary">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link component={RouterLink} to="/privacy" color="primary">
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />
                    {errors.agreeToTerms && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errors.agreeToTerms}
                      </Alert>
                    )}
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeToMarketing}
                        onChange={handleInputChange('agreeToMarketing')}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I want to receive marketing emails about new products and special offers
                      </Typography>
                    }
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <Typography variant="body2" textAlign="center">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" color="primary">
                      Sign in here
                    </Link>
                  </Typography>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default RegisterPage;
