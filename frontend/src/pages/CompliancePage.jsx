import React, { useState } from 'react';
import { useConfigAuditReports } from '../hooks/useCompliance';
import { 
  Box, Container, Typography, Button, Alert, 
  CircularProgress, Grid, Paper, TextField, Autocomplete,
  Card, CardContent, Tab, Tabs, Divider, FormControl,
  InputLabel, Select, MenuItem, IconButton, Tooltip,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

import Header from '../components/common/Header';
import ComplianceOverview from '../components/dashboard/ComplianceOverview';
import { useComplianceSummary, useVulnerabilityReports } from '../hooks/useVulnerabilities';
import { usePolicies } from '../hooks/usePolicies';

const getSeverityColor = (severity) => {
  if (typeof severity !== 'string') {
    return 'default'; 
  }
  
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'error';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusIcon = (success) => {
  return success ? 
    <CheckIcon color="success" /> : 
    <ErrorIcon color="error" />;
};

const CompliancePage = () => {
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const { 
    data: complianceSummary, 
    isLoading: isLoadingCompliance, 
    refetch: refetchCompliance 
  } = useComplianceSummary(selectedNamespace);
  
  const {
    data: configAuditReports,
    isLoading: isLoadingAudit,
    refetch: refetchAudit
  } = useConfigAuditReports(selectedNamespace);
  
  const {
    data: vulnerabilityReports,
    isLoading: isLoadingVulnerability,
    refetch: refetchVulnerability
  } = useVulnerabilityReports(selectedNamespace);
  
  const {
    data: policies,
    isLoading: isLoadingPolicies,
    refetch: refetchPolicies
  } = usePolicies();
  
  const namespaceOptions = React.useMemo(() => {
    const namespaces = new Set(['']);
    
    if (configAuditReports && Array.isArray(configAuditReports)) {
      configAuditReports.forEach(report => {
        if (report.namespace) {
          namespaces.add(report.namespace);
        }
      });
    }
    
    if (vulnerabilityReports && Array.isArray(vulnerabilityReports)) {
      vulnerabilityReports.forEach(report => {
        if (report.namespace) {
          namespaces.add(report.namespace);
        }
      });
    }
    
    return Array.from(namespaces);
  }, [configAuditReports, vulnerabilityReports]);
  
  const complianceStats = React.useMemo(() => {
    if (!complianceSummary) return null;
    
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    
    if (complianceSummary.configAuditResults) {
      compliantCount = complianceSummary.configAuditResults.totalChecks - complianceSummary.configAuditResults.failedChecks;
      nonCompliantCount = complianceSummary.configAuditResults.critical + complianceSummary.configAuditResults.high;
      warningCount = complianceSummary.configAuditResults.medium;
      errorCount = complianceSummary.configAuditResults.low;
    }
    
    return {
      compliantCount,
      nonCompliantCount,
      warningCount,
      errorCount
    };
  }, [complianceSummary]);
  
  const handleRefresh = () => {
    refetchCompliance();
    refetchAudit();
    refetchVulnerability();
    refetchPolicies();
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const renderConfigAuditTab = () => {
    if (isLoadingAudit) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!configAuditReports || configAuditReports.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum relatório de auditoria de configuração disponível para o namespace selecionado.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {configAuditReports.map((report, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {report.name}
                </Typography>
                <Box>
                  <Chip 
                    label={`Críticas: ${report.criticalCount}`} 
                    color="error" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Altas: ${report.highCount}`} 
                    color="error" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Médias: ${report.mediumCount}`} 
                    color="warning" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Baixas: ${report.lowCount}`} 
                    color="success" 
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Namespace: {report.namespace}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Verificações de Configuração
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%">Status</TableCell>
                      <TableCell width="40%">Verificação</TableCell>
                      <TableCell width="15%">Severidade</TableCell>
                      <TableCell>Descrição</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.checks.map((check, checkIndex) => (
                      <TableRow key={checkIndex} hover>
                        <TableCell>
                          {getStatusIcon(check.success)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {check.title || check.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {check.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={check.severity}
                            size="small"
                            color={getSeverityColor(check.severity)}
                          />
                        </TableCell>
                        <TableCell>
                          {check.description || 'Sem descrição disponível'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  
  // Renderização da aba de Vulnerabilidades
  const renderVulnerabilitiesTab = () => {
    if (isLoadingVulnerability) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!vulnerabilityReports || vulnerabilityReports.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhum relatório de vulnerabilidade disponível para o namespace selecionado.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {vulnerabilityReports.map((report, index) => {
          // Agrupar vulnerabilidades por severidade
          const bySeverity = report.vulnerabilities.reduce((acc, vuln) => {
            const severity = vuln.severity.toUpperCase();
            if (!acc[severity]) acc[severity] = 0;
            acc[severity]++;
            return acc;
          }, {});
          
          return (
            <Card key={index} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Imagem: {report.imageName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.vulnerabilities.length} vulnerabilidades
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Namespace: {report.namespace}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                  {Object.entries(bySeverity).map(([severity, count]) => (
                    <Chip
                      key={severity}
                      label={`${severity}: ${count}`}
                      color={getSeverityColor(severity)}
                      size="small"
                    />
                  ))}
                </Box>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => {/* Implementar visualização detalhada */}}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };
  
  const renderPoliciesTab = () => {
    if (isLoadingPolicies) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!policies || policies.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhuma política de conformidade configurada.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Severidade</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id} hover>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.severity}
                      color={getSeverityColor(policy.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{policy.ruleType}</TableCell>
                  <TableCell>
                    {policy.enabled ? (
                      <Chip
                        icon={<CheckIcon />}
                        label="Ativo"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label="Inativo"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  return (
    <>
      <Header title="Compliance" onRefresh={handleRefresh} />
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              Monitoramento de Compliance
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel id="namespace-select-label">Namespace</InputLabel>
                <Select
                  labelId="namespace-select-label"
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  label="Namespace"
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  {namespaceOptions.filter(ns => ns !== '').map((ns) => (
                    <MenuItem key={ns} value={ns}>{ns}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={handleRefresh}
                disabled={isLoadingCompliance || isLoadingAudit || isLoadingVulnerability}
              >
                {(isLoadingCompliance || isLoadingAudit || isLoadingVulnerability) ? 
                  "Executando..." : "Verificar Compliance"}
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <ComplianceOverview stats={complianceStats} />
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="Auditoria de Configuração" />
                  <Tab label="Vulnerabilidades" />
                  <Tab label="Políticas" />
                </Tabs>
                
                <Divider />
                
                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && renderConfigAuditTab()}
                  {activeTab === 1 && renderVulnerabilitiesTab()}
                  {activeTab === 2 && renderPoliciesTab()}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default CompliancePage;