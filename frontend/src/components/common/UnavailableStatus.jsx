import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const UnavailableStatus = ({ title, message, onRetry }) => {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 200
      }}
    >
      <ErrorIcon 
        color="action" 
        sx={{ 
          fontSize: 48, 
          mb: 2, 
          color: '#bdbdbd',
          animation: 'pulse 2s infinite ease-in-out'
        }} 
      />
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title || 'Dados indisponíveis'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 2 }}>
        {message || 'Não foi possível carregar os dados. Tente novamente mais tarde.'}
      </Typography>
      
      {onRetry && (
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<RefreshIcon />}
          onClick={onRetry} 
          sx={{ mt: 1 }}
        >
          Tentar novamente
        </Button>
      )}
      
      <style jsx="true">{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </Paper>
  );
};

export default UnavailableStatus;