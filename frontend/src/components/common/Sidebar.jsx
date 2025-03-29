import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Box, Toolbar 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Policy as PolicyIcon,
  BugReport as VulnerabilityIcon,
  Security as ComplianceIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Sidebar = ({ width = 240 }) => {
  const location = useLocation();
  
  const pathTitles = {
    '/': 'Dashboard',
    '/policies': 'Políticas',
    '/vulnerabilities': 'Vulnerabilidades',
    '/compliance': 'Conformidade',
    '/settings': 'Configurações'
  };

  const currentPageTitle = pathTitles[location.pathname] || 'Página Desconhecida';
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Políticas', icon: <PolicyIcon />, path: '/policies' },
    { text: 'Vulnerabilidades', icon: <VulnerabilityIcon />, path: '/vulnerabilities' },
    { text: 'Conformidade', icon: <ComplianceIcon />, path: '/compliance' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {currentPageTitle}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Kubernetes compliance monitor for OpenShift
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;