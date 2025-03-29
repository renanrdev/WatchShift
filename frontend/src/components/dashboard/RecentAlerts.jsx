import React from 'react';
import { 
  Card, CardContent, Typography, List, ListItem, 
  ListItemText, ListItemIcon, Divider, Box, Chip
} from '@mui/material';
import { 
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsOff as NoAlertsIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const getSeverityIcon = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return <ErrorIcon color="error" />;
    case 'medium':
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'low':
      return <SuccessIcon color="success" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
    case 'warning':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'info';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data desconhecida';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return 'Data inválida';
  }
};

const RecentAlerts = ({ alerts }) => {
  if (!alerts || !Array.isArray(alerts)) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alertas Recentes
          </Typography>
          <Box 
            sx={{ 
              py: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <NoAlertsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              Dados de alertas não disponíveis
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Alertas Recentes
        </Typography>
        
        {alerts.length === 0 ? (
          <Box 
            sx={{ 
              py: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <NoAlertsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              Nenhum alerta recente
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {alerts.map((alert, index) => (
              <React.Fragment key={alert.id || index}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {alert.title || 'Alerta sem título'}
                        <Chip 
                          label={alert.severity} 
                          size="small" 
                          color={getSeverityColor(alert.severity)}
                          sx={{ ml: 1 }}
                        />
                        {alert.source && alert.source !== 'Database' && (
                          <Chip 
                            label={alert.source} 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {alert.resource || 'Recurso não especificado'}
                        </Typography>
                        {` - ${alert.message || 'Sem detalhes adicionais'}`}
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDate(alert.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;