import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ComplianceOverview = ({ stats }) => {
  // Definir valores padrão caso stats não exista
  const safeStats = stats || { compliantCount: 0, nonCompliantCount: 0, warningCount: 0, errorCount: 0 };
  const { compliantCount = 0, nonCompliantCount = 0, warningCount = 0, errorCount = 0 } = safeStats;
  
  // Calcular total de verificações
  const total = useMemo(() => compliantCount + nonCompliantCount + warningCount + errorCount, 
    [compliantCount, nonCompliantCount, warningCount, errorCount]);
  
  // Calcular a porcentagem de conformidade
  const compliantPercentage = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((compliantCount / total) * 100);
  }, [compliantCount, total]);
  
  // Preparar dados para o gráfico
  const data = useMemo(() => [
    { name: 'Conforme', value: compliantCount, color: '#4caf50' },
    { name: 'Não conforme', value: nonCompliantCount, color: '#f44336' },
    { name: 'Alerta', value: warningCount, color: '#ff9800' },
    { name: 'Erro', value: errorCount, color: '#9e9e9e' }
  ].filter(item => item.value > 0), [compliantCount, nonCompliantCount, warningCount, errorCount]);

  // Verificação de dados válidos para exibir
  const hasValidData = useMemo(() => stats !== null && typeof stats === 'object', [stats]);
  
  // Determinar a cor do indicador de conformidade
  const getComplianceColor = (percentage) => {
    if (percentage > 80) return 'success.main';
    if (percentage > 60) return 'warning.main';
    return 'error.main';
  };

  // Formatador tooltip
  const tooltipFormatter = (value, name) => {
    const percentage = Math.round((value / total) * 100);
    return [`${value} (${percentage}%)`, name];
  };

  if (!hasValidData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Visão Geral de Conformidade
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            Dados de conformidade não disponíveis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Visão Geral de Conformidade
        </Typography>
        
        {total === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            Nenhum dado de conformidade disponível
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Box height={200} display="flex" alignItems="center" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={tooltipFormatter}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box display="flex" flexDirection="column" height="100%" justifyContent="center">
                <Box sx={{ position: 'relative', display: 'inline-flex', mx: 'auto', mb: 2 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={compliantPercentage} 
                    size={100} 
                    thickness={5} 
                    sx={{ 
                      color: getComplianceColor(compliantPercentage),
                      position: 'relative',
                      circle: {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary" fontWeight="bold">
                      {compliantPercentage}%
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
                  Conformidade geral
                </Typography>
                
                {compliantPercentage === 0 && total > 0 && (
                  <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
                    Nenhum item está em conformidade
                  </Alert>
                )}
                
                <Box mt={2}>
                  {data.map((item) => (
                    <Box key={item.name} display="flex" alignItems="center" mb={1}>
                      <Box 
                        width={12} 
                        height={12} 
                        bgcolor={item.color} 
                        mr={1} 
                        borderRadius="50%"
                      />
                      <Typography variant="body2">
                        {item.name}: {item.value}
                      </Typography>
                    </Box>
                  ))}
                  <Box display="flex" alignItems="center" mt={2}>
                    <Typography variant="body2" fontWeight="medium">
                      Total de verificações: {total}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceOverview;