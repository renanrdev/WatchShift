import React from 'react';
import { Box, Typography, LinearProgress, Paper, CircularProgress } from '@mui/material';

const ScanProgress = ({ isScanning, message, progress = null }) => {
  if (!isScanning) return null;
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography variant="body1" gutterBottom>
        {message || 'Escaneando imagens. Esta operação pode levar alguns minutos...'}
      </Typography>
      
      <Box sx={{ width: '100%', mt: 2, position: 'relative' }}>
        {progress !== null ? (
          <LinearProgress variant="determinate" value={progress} />
        ) : (
          <LinearProgress />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Processando...
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScanProgress;