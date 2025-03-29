import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Alert, 
  CircularProgress, Grid, Paper, TextField, Autocomplete,
  Card, CardContent, Tab, Tabs, Divider
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Scanner as ScannerIcon,
  List as ListIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import Header from '../components/common/Header';
import ScanProgress from '../components/vulnerabilities/ScanProgress';
import ScanDetailsCard from '../components/vulnerabilities/ScanDetailsCard';
import VulnerabilityChart from '../components/dashboard/VulnerabilityChart';

import { 
  useScanImage, 
  useStartBatchScan, 
  useNamespaceSummary,
  useVulnerabilityReports,
  useComplianceSummary
} from '../hooks/useVulnerabilities';

const VulnerabilitiesPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('default');
  const [inputImage, setInputImage] = useState('');
  const [namespaceOptions, setNamespaceOptions] = useState(['default', 'kube-system']);
  
  const { 
    data: namespaceSummary, 
    isLoading: isLoadingNamespace,
    isError: isNamespaceError,
    error: namespaceError,
    refetch: refetchNamespace
  } = useNamespaceSummary(selectedNamespace);
  
  const {
    data: vulnerabilityReports,
    isLoading: isLoadingReports,
    refetch: refetchReports
  } = useVulnerabilityReports(selectedNamespace);
  
  const {
    data: complianceSummary,
    isLoading: isLoadingCompliance,
    refetch: refetchCompliance
  } = useComplianceSummary(selectedNamespace);
  
  const { 
    mutate: scanSingleImage, 
    isLoading: isScanningImage,
    isError: isScanImageError,
    error: scanImageError
  } = useScanImage();
  
  const { 
    mutate: scanAllImages, 
    isLoading: isScanningAll,
    isError: isScanAllError,
    error: scanAllError,
    data: batchScanData
  } = useStartBatchScan();
  
  useEffect(() => {
    if (vulnerabilityReports && Array.isArray(vulnerabilityReports)) {
      const imageSet = new Set();
      vulnerabilityReports.forEach(report => {
        if (report.imageName) {
          imageSet.add(report.imageName);
        }
      });
      
      const namespaces = new Set(['default']);
      vulnerabilityReports.forEach(report => {
        if (report.namespace) {
          namespaces.add(report.namespace);
        }
      });
      
      setNamespaceOptions(Array.from(namespaces));
    }
  }, [vulnerabilityReports]);
  
  const imageOptions = React.useMemo(() => {
    const options = new Set();
    
    if (vulnerabilityReports && Array.isArray(vulnerabilityReports)) {
      vulnerabilityReports.forEach(report => {
        if (report.imageName) {
          options.add(report.imageName);
        }
      });
    }
    
    if (namespaceSummary && namespaceSummary.images) {
      Object.keys(namespaceSummary.images).forEach(image => {
        options.add(image);
      });
    }
    
    return Array.from(options);
  }, [vulnerabilityReports, namespaceSummary]);
  
  // Handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRefresh = () => {
    refetchNamespace();
    refetchReports();
    refetchCompliance();
  };
  
  const handleScanImage = () => {
    if (inputImage) {
      scanSingleImage({ imageName: inputImage, force: true });
      setSelectedImage(inputImage);
    }
  };
  
  const handleScanAll = () => {
    scanAllImages(true);
  };
  
  const vulnerabilityChartData = React.useMemo(() => {
    if (complianceSummary && complianceSummary.vulnerabilities) {
      return {
        critical: complianceSummary.vulnerabilities.critical || 0,
        high: complianceSummary.vulnerabilities.high || 0,
        medium: complianceSummary.vulnerabilities.medium || 0,
        low: complianceSummary.vulnerabilities.low || 0,
        unknown: complianceSummary.vulnerabilities.unknown || 0
      };
    }
    
    if (namespaceSummary) {
      return {
        critical: namespaceSummary.criticalVulnerabilities || 0,
        high: namespaceSummary.highVulnerabilities || 0,
        medium: 0, 
        low: 0,   
        unknown: 0 
      };
    }
    
    return null;
  }, [complianceSummary, namespaceSummary]);
  
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Dashboard
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Namespace: {selectedNamespace}
                  </Typography>
                  
                  {isLoadingNamespace || isLoadingCompliance ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : isNamespaceError ? (
                    <Alert severity="error">
                      Erro ao carregar dados do namespace: {namespaceError?.message}
                    </Alert>
                  ) : namespaceSummary || complianceSummary ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Imagens escaneadas:
                        </Typography>
                        <Typography variant="h5">
                          {complianceSummary?.totalImageCount || namespaceSummary?.imageCount || 0}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total de vulnerabilidades:
                        </Typography>
                        <Typography variant="h5">
                          {complianceSummary?.vulnerabilities?.total || namespaceSummary?.totalVulnerabilities || 0}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Vulnerabilidades críticas:
                        </Typography>
                        <Typography variant="h5" color="error">
                          {complianceSummary?.vulnerabilities?.critical || namespaceSummary?.criticalVulnerabilities || 0}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Último escaneamento:
                        </Typography>
                        <Typography variant="body1">
                          {namespaceSummary?.scanTime 
                            ? new Date(namespaceSummary.scanTime).toLocaleString() 
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      Sem dados disponíveis para o namespace selecionado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <VulnerabilityChart data={vulnerabilityChartData} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Imagens Escaneadas
                </Typography>
                
                {selectedImage ? (
                  <ScanDetailsCard imageName={selectedImage} />
                ) : (
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        Selecione uma imagem para ver os detalhes do escaneamento
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Grid>
          </Grid>
        );
        
      case 1: // Scan Individual
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Escanear Imagem Individual
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Nome da Imagem"
                    variant="outlined"
                    value={inputImage}
                    onChange={(e) => setInputImage(e.target.value)}
                    placeholder="Ex: nginx:latest"
                    sx={{ mr: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ScannerIcon />}
                    onClick={handleScanImage}
                    disabled={!inputImage || isScanningImage}
                  >
                    {isScanningImage ? 'Escaneando...' : 'Escanear'}
                  </Button>
                </Box>
                
                {isScanImageError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {scanImageError?.message || 'Erro ao escanear imagem'}
                  </Alert>
                )}
                
                {isScanningImage && (
                  <ScanProgress 
                    isScanning={true} 
                    message={`Escaneando imagem: ${inputImage}`}
                  />
                )}
                
                {selectedImage && !isScanningImage && (
                  <ScanDetailsCard imageName={selectedImage} />
                )}
              </Paper>
            </Grid>
          </Grid>
        );
        
      case 2: // Scan do Cluster
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Escanear Todo o Cluster
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Esta opção escaneará todas as imagens em execução no cluster Kubernetes. 
                    O processo pode levar vários minutos dependendo do número de imagens.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ScannerIcon />}
                    onClick={handleScanAll}
                    disabled={isScanningAll}
                  >
                    {isScanningAll ? 'Escaneando Cluster...' : 'Iniciar Escaneamento Completo'}
                  </Button>
                </Box>
                
                {isScanAllError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {scanAllError?.message || 'Erro ao iniciar escaneamento'}
                  </Alert>
                )}
                
                {isScanningAll && (
                  <ScanProgress 
                    isScanning={true} 
                    message="Escaneando todas as imagens do cluster. Esta operação pode levar vários minutos."
                  />
                )}
                
                {batchScanData && !isScanningAll && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Escaneamento concluído! Foram escaneadas {batchScanData.scannedImages || 0} imagens.
                  </Alert>
                )}

                {batchScanData && batchScanData.imageList && batchScanData.imageList.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Imagens Escaneadas
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                      {batchScanData.imageList.map((image, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            py: 1, 
                            borderBottom: index < batchScanData.imageList.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          <Typography variant="body2">
                            {image}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        );
        
      default:
        return <div>Tab não implementada</div>;
    }
  };
  
  return (
    <>
      <Header title="Vulnerabilidades" onRefresh={handleRefresh} />
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
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={selectedNamespace}
                  onChange={(event, newValue) => {
                    setSelectedNamespace(newValue);
                  }}
                  options={namespaceOptions}
                  renderInput={(params) => (
                    <TextField {...params} label="Namespace" variant="outlined" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={selectedImage}
                  onChange={(event, newValue) => {
                    setSelectedImage(newValue);
                  }}
                  inputValue={inputImage}
                  onInputChange={(event, newValue) => {
                    setInputImage(newValue);
                  }}
                  options={imageOptions}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} label="Imagem" variant="outlined" />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<DashboardIcon />} label="Dashboard" />
              <Tab icon={<ScannerIcon />} label="Scan Individual" />
              <Tab icon={<ListIcon />} label="Scan Cluster" />
            </Tabs>
          </Paper>
          
          {renderTabContent()}
        </Container>
      </Box>
    </>
  );
};

export default VulnerabilitiesPage;