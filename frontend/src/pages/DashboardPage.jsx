import React from 'react';
import { Container, Grid, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import Header from '../components/common/Header';
import ComplianceOverview from '../components/dashboard/ComplianceOverview';
import VulnerabilityChart from '../components/dashboard/VulnerabilityChart';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import UnavailableStatus from '../components/common/UnavailableStatus';
import { useDashboardData } from '../hooks/useDashboard';

const DashboardPage = () => {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title="Dashboard" onRefresh={handleRefresh} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 3,
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
          }}
        >
          <Container maxWidth="xl">
            <Alert severity="error" sx={{ mb: 3 }}>
              {error?.message || 'Erro ao carregar dados do dashboard'}
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <UnavailableStatus 
                  title="Status de conformidade indisponível" 
                  message="Não foi possível carregar as informações de conformidade"
                  onRetry={handleRefresh}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <UnavailableStatus 
                  title="Dados de vulnerabilidades indisponíveis" 
                  message="Não foi possível carregar as informações de vulnerabilidades"
                  onRetry={handleRefresh}
                />
              </Grid>
              <Grid item xs={12}>
                <UnavailableStatus 
                  title="Alertas recentes indisponíveis" 
                  message="Não foi possível carregar os alertas recentes"
                  onRetry={handleRefresh}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </>
    );
  }

  const hasPartialFailure = data?.partialFailure === true;

  return (
    <>
      <Header title="Dashboard" onRefresh={handleRefresh} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="xl">
          {hasPartialFailure && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Alguns dados do dashboard estão temporariamente indisponíveis
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <ComplianceOverview stats={data?.complianceStats} />
            </Grid>
            <Grid item xs={12} md={4}>
              <VulnerabilityChart data={data?.vulnerabilityStats} />
            </Grid>
            <Grid item xs={12}>
              <RecentAlerts alerts={data?.recentAlerts} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;