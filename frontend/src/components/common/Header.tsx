import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Search,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { total } = useSelector((state: RootState) => state.cart);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const isMenuOpen = Boolean(anchorEl);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
        Profile
      </MenuItem>
      <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
        My Orders
      </MenuItem>
      {user?.role === 'admin' && (
        <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
          Admin Dashboard
        </MenuItem>
      )}
      <MenuItem onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
          }}
        >
          Bidias E-Com
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/products"
            sx={{ textTransform: 'none' }}
          >
            Products
          </Button>

          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                component={Link}
                to="/cart"
                aria-label="shopping cart"
              >
                <Badge badgeContent={total} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/register"
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      {renderMenu}
    </AppBar>
  );
};

export default Header;
