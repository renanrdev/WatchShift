import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Chip, 
  Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress,
  Tabs, Tab, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import { 
  Link as LinkIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useScanResult } from '../../hooks/useVulnerabilities';

/**
 * Função auxiliar para determinar a cor da severidade
 * 
 * @param {string} severity - O nível de severidade
 * @returns {string} A cor correspondente para o componente MUI
 */
const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'error';
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

/**
 * Função para formatar a data
 * 
 * @param {string} dateString - A string de data para formatar
 * @returns {string} A data formatada
 */
const formatDateTime = (dateString) => {
  if (!dateString) return 'Data desconhecida';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return 'Data inválida';
  }
};

/**
 * Componente para mostrar os detalhes de uma vulnerabilidade específica
 */
const VulnerabilityDetailDialog = ({ vulnerability, open, onClose }) => {
  if (!vulnerability) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Detalhes da Vulnerabilidade: {vulnerability.id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Severidade:
            </Typography>
            <Chip
              label={vulnerability.severity}
              color={getSeverityColor(vulnerability.severity)}
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Pacote Afetado
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body1">
              {vulnerability.package_name || vulnerability.pkgName}
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Versão Instalada:
              </Typography>
              <Typography variant="body2">
                {vulnerability.installed_version || vulnerability.installedVersion}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Versão Corrigida:
              </Typography>
              <Typography variant="body2">
                {vulnerability.fixed_version || vulnerability.fixedVersion || 'N/A'}
              </Typography>
            </Box>
          </Paper>
          
          {vulnerability.cvss_score || vulnerability.cvssScore ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                CVSS Score
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1">
                  {vulnerability.cvss_score || vulnerability.cvssScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pontuação de severidade de vulnerabilidade comum
                </Typography>
              </Paper>
            </Box>
          ) : null}
          
          {vulnerability.description && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Descrição
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  {vulnerability.description}
                </Typography>
              </Paper>
            </Box>
          )}
          
          {vulnerability.references && vulnerability.references.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Referências
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {vulnerability.references.map((ref, index) => (
                    <li key={index}>
                      <Button
                        variant="text"
                        startIcon={<OpenInNewIcon />}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      >
                        {ref.length > 50 ? `${ref.substring(0, 50)}...` : ref}
                      </Button>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Componente principal para exibir os detalhes de escaneamento de uma imagem
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.imageName - Nome da imagem escaneada
 */
const ScanDetailsCard = ({ imageName }) => {
  const [tabValue, setTabValue] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Hook React Query para buscar o resultado do escaneamento
  const { data, isLoading, isError, error } = useScanResult(imageName);
  
  // Handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleFilterChange = (severity) => {
    setSeverityFilter(severity === severityFilter ? 'all' : severity);
  };
  
  const handleVulnerabilityDetail = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>
            Carregando resultados do escaneamento...
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            Erro ao carregar resultados
          </Typography>
          <Typography variant="body2">
            {error?.message || 'Não foi possível obter os detalhes do escaneamento.'}
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            Sem dados disponíveis
          </Typography>
          <Typography variant="body2">
            Não há resultados de escaneamento para esta imagem.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Normalizar os dados de vulnerabilidades
  const normalizeVulnerabilities = (vulns) => {
    if (!vulns || !Array.isArray(vulns)) return [];
    
    return vulns.map(vuln => ({
      id: vuln.id,
      package_name: vuln.package_name || vuln.pkgName,
      installed_version: vuln.installed_version || vuln.installedVersion,
      fixed_version: vuln.fixed_version || vuln.fixedVersion || '',
      severity: vuln.severity,
      description: vuln.description || '',
      references: vuln.references || [],
      cvss_score: vuln.cvss_score || vuln.cvssScore
    }));
  };
  
  // Organizar as vulnerabilidades por severidade
  const vulnerabilities = normalizeVulnerabilities(data.vulnerabilities);
  
  const sortedVulnerabilities = [...vulnerabilities].sort((a, b) => {
    const severityOrder = {
      'CRITICAL': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3,
      'UNKNOWN': 4
    };
    
    return (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999);
  });
  
  // Aplicar filtro de severidade
  const filteredVulnerabilities = sortedVulnerabilities.filter(vuln => 
    severityFilter === 'all' || vuln.severity.toLowerCase() === severityFilter.toLowerCase()
  );
  
  // Obter estatísticas de vulnerabilidades
  const vulnerabilityStats = (data.severity_counts || {});
  
  // Função para renderizar o conteúdo da guia selecionada
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Vulnerabilidades
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">
                Vulnerabilidades Detectadas ({filteredVulnerabilities.length} de {sortedVulnerabilities.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Filtrar por severidade">
                  <IconButton size="small">
                    <FilterIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Chip
                  label="Crítica"
                  size="small"
                  color={severityFilter === 'critical' ? 'error' : 'default'}
                  variant={severityFilter === 'critical' ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('critical')}
                  clickable
                />
                <Chip
                  label="Alta"
                  size="small"
                  color={severityFilter === 'high' ? 'error' : 'default'}
                  variant={severityFilter === 'high' ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('high')}
                  clickable
                />
                <Chip
                  label="Média"
                  size="small"
                  color={severityFilter === 'medium' ? 'warning' : 'default'}
                  variant={severityFilter === 'medium' ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('medium')}
                  clickable
                />
                <Chip
                  label="Baixa"
                  size="small"
                  color={severityFilter === 'low' ? 'success' : 'default'}
                  variant={severityFilter === 'low' ? 'filled' : 'outlined'}
                  onClick={() => handleFilterChange('low')}
                  clickable
                />
              </Box>
            </Box>
            
            {filteredVulnerabilities.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Pacote</TableCell>
                      <TableCell>Versão Atual</TableCell>
                      <TableCell>Versão Corrigida</TableCell>
                      <TableCell>Severidade</TableCell>
                      <TableCell>CVSS</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVulnerabilities.map((vuln) => (
                      <TableRow key={vuln.id} hover>
                        <TableCell>{vuln.id}</TableCell>
                        <TableCell>{vuln.package_name}</TableCell>
                        <TableCell>{vuln.installed_version}</TableCell>
                        <TableCell>{vuln.fixed_version || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={vuln.severity}
                            size="small"
                            color={getSeverityColor(vuln.severity)}
                          />
                        </TableCell>
                        <TableCell>{vuln.cvss_score || 'N/A'}</TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalhes">
                            <IconButton 
                              size="small"
                              onClick={() => handleVulnerabilityDetail(vuln)}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {vuln.references && vuln.references.length > 0 && (
                            <Tooltip title="Links de referência">
                              <IconButton 
                                size="small"
                                component="a" 
                                href={vuln.references[0]} 
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <LinkIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Nenhuma vulnerabilidade encontrada com o filtro selecionado
                </Typography>
                {severityFilter !== 'all' && (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => setSeverityFilter('all')}
                    sx={{ mt: 1 }}
                  >
                    Limpar filtro
                  </Button>
                )}
              </Box>
            )}
          </>
        );
        
      case 1: // Detalhes
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Informações da Imagem
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" width="30%" sx={{ fontWeight: 'medium' }}>
                        Nome da Imagem
                      </TableCell>
                      <TableCell>{data.image_name || data.imageName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Data do Escaneamento
                      </TableCell>
                      <TableCell>{formatDateTime(data.scan_time || data.scanTime)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Fonte do Escaneamento
                      </TableCell>
                      <TableCell>
                        {data.metadata?.source || 'Trivy Scanner'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                        Total de Vulnerabilidades
                      </TableCell>
                      <TableCell>
                        {vulnerabilities.length || 0}
                      </TableCell>
                    </TableRow>
                    {data.metadata && Object.keys(data.metadata).length > 0 && 
                     Object.entries(data.metadata)
                     .filter(([key]) => !key.includes('source'))
                     .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" sx={{ fontWeight: 'medium' }}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </TableCell>
                        <TableCell>
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Resumo por Severidade
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Severidade</TableCell>
                    <TableCell>Contagem</TableCell>
                    <TableCell>Porcentagem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(vulnerabilityStats).map(([severity, count]) => {
                    const totalVulns = vulnerabilities.length;
                    const percentage = totalVulns > 0 ? Math.round((count / totalVulns) * 100) : 0;
                    
                    return (
                      <TableRow key={severity}>
                        <TableCell>
                          <Chip
                            label={severity}
                            size="small"
                            color={getSeverityColor(severity)}
                          />
                        </TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>{percentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
        
      default:
        return <div>Guia não implementada</div>;
    }
  };
  
  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detalhes do Escaneamento
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Imagem:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {data.image_name || data.imageName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Data do Escaneamento:
            </Typography>
            <Typography variant="body1">
              {formatDateTime(data.scan_time || data.scanTime)}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Resumo de Vulnerabilidades
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {Object.entries(vulnerabilityStats).map(([severity, count]) => (
              <Chip
                key={severity}
                label={`${severity}: ${count}`}
                color={getSeverityColor(severity)}
                variant={count > 0 ? 'filled' : 'outlined'}
                onClick={() => handleFilterChange(severity.toLowerCase())}
                clickable
              />
            ))}
          </Box>
          
          {Object.keys(vulnerabilityStats).length > 0 && (
            <>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="Vulnerabilidades" />
                <Tab label="Detalhes" />
              </Tabs>
              
              {renderTabContent()}
            </>
          )}
          
          {Object.keys(vulnerabilityStats).length === 0 && (
            <Alert severity="success">
              Nenhuma vulnerabilidade encontrada nesta imagem.
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <VulnerabilityDetailDialog 
        vulnerability={selectedVulnerability}
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
      />
    </>
  );
};

export default ScanDetailsCard;