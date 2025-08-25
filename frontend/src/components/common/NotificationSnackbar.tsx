import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertProps['severity'];
  autoHideDuration?: number;
  onClose: () => void;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity = 'success',
  autoHideDuration = 3000,
  onClose
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
