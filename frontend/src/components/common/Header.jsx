import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Notifications as NotificationsIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import logo from '../../../src/logo.svg';

const Header = ({ onRefresh }) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo} 
            alt="WatchShift Logo" 
            style={{ height: '40px', marginRight: '10px' }}
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              marginLeft: '8px'
            }}
          >
            WatchShift
          </Typography>
        </Box>
        <Box>
          {onRefresh && (
            <IconButton color="inherit" onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          )}
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;