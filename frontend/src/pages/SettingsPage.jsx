import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  CircularProgress,
  Backdrop
} from '@mui/material';

import {
  Save as SaveIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Cancel as CancelIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import Header from '../components/common/Header';
import { useTestTrivyConnection } from '../hooks/useVulnerabilities';
import apiClient from '../api/client';

// Componente de teste de conexão com Trivy
const TrivyConnectionTest = () => {
  const { data, isLoading, isError, error, refetch } = useTestTrivyConnection();
  
  const handleTest = () => {
    refetch();
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Teste de Conexão com o Trivy
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Verifica se o scanner de vulnerabilidades Trivy está disponível e funcionando corretamente.
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Testando conexão com o Trivy...</Typography>
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao testar Trivy: {error?.message || 'Erro desconhecido'}
          </Alert>
        ) : data ? (
          <Alert 
            severity={data.trivy_available ? "success" : "error"}
            sx={{ mb: 2 }}
          >
            {data.message}
          </Alert>
        ) : null}
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={handleTest}
          startIcon={<RefreshIcon />}
          disabled={isLoading}
        >
          Testar Trivy
        </Button>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  // Estados
  const [settings, setSettings] = useState({
    scanSettings: {
      trivyPath: "/usr/local/bin/trivy",
      scanIntervalHours: 24,
      timeout: 300,
      useOperatorScanner: true
    },
    kubernetesSettings: {
      kubeConfigPath: "~/.kube/config",
      apiUrl: "",
      token: "",
      verifySSL: true
    },
    databaseSettings: {
      connectionString: "Host=localhost;Database=compliancemonitor;Username=postgres;Password=dbpassword;Port=5432"
    },
    loggingSettings: {
      logLevel: "INFO",
      debug: false
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  
  // Função para carregar as configurações da API
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/settings');
      setSettings(response.data);
    } catch (err) {
      setError(`Erro ao carregar configurações: ${err.message}`);
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar configurações ao iniciar
  useEffect(() => {
    loadSettings();
  }, []);
  
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/settings', settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(`Erro ao salvar configurações: ${err.message}`);
      console.error('Error saving settings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleRefresh = () => {
    loadSettings();
  };
  
  // Testar conexão com Kubernetes
  const testKubernetesConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const response = await apiClient.get('/kubernetes/connection-test');
      setConnectionStatus({
        success: response.data.connected,
        message: response.data.message || "Conexão com Kubernetes estabelecida com sucesso."
      });
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: `Erro na conexão: ${err.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  // Handler para limpar cache
  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/maintenance/clear-cache');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(`Erro ao limpar cache: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler para testar todas conexões
  const handleTestAllConnections = async () => {
    setIsLoading(true);
    try {
      await apiClient.get('/maintenance/test-connections');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(`Erro ao testar conexões: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler para backup do banco
  const handleDatabaseBackup = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/maintenance/database-backup');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(`Erro ao fazer backup: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler para redefinir configurações
  const handleResetSettings = async () => {
    if (window.confirm('Tem certeza que deseja reiniciar todas as configurações para os valores padrão?')) {
      setIsLoading(true);
      try {
        await apiClient.post('/settings/reset');
        await loadSettings();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        setError(`Erro ao redefinir configurações: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handler para limpar todos os dados
  const handleClearAllData = async () => {
    if (window.confirm('ATENÇÃO: Esta ação excluirá todos os dados do banco. Essa ação não pode ser desfeita. Deseja continuar?')) {
      setIsLoading(true);
      try {
        await apiClient.post('/maintenance/clear-all-data');
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } catch (err) {
        setError(`Erro ao limpar dados: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Header title="Configurações" onRefresh={handleRefresh} />
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
              Configurações do Sistema
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={saveSettings}
              disabled={isLoading}
            >
              Salvar Configurações
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Snackbar
            open={isSaved}
            autoHideDuration={3000}
            onClose={() => setIsSaved(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              Configurações salvas com sucesso!
            </Alert>
          </Snackbar>
          
          <Grid container spacing={3}>
            {/* Configurações de Escaneamento */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Configurações de Escaneamento" 
                  subheader="Defina como o Trivy scanner funciona"
                />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Caminho do Trivy"
                      value={settings.scanSettings.trivyPath}
                      onChange={(e) => handleChange('scanSettings', 'trivyPath', e.target.value)}
                      margin="normal"
                      helperText="Caminho para o executável do Trivy"
                    />
                    
                    <TextField
                      fullWidth
                      label="Intervalo de Escaneamento (horas)"
                      type="number"
                      value={settings.scanSettings.scanIntervalHours}
                      onChange={(e) => handleChange('scanSettings', 'scanIntervalHours', Number(e.target.value))}
                      margin="normal"
                      helperText="Intervalo entre escaneamentos automáticos"
                      InputProps={{ inputProps: { min: 1, max: 168 } }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Timeout (segundos)"
                      type="number"
                      value={settings.scanSettings.timeout}
                      onChange={(e) => handleChange('scanSettings', 'timeout', Number(e.target.value))}
                      margin="normal"
                      helperText="Timeout para operações de escaneamento"
                      InputProps={{ inputProps: { min: 60, max: 1800 } }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.scanSettings.useOperatorScanner}
                          onChange={(e) => handleChange('scanSettings', 'useOperatorScanner', e.target.checked)}
                        />
                      }
                      label="Utilizar Trivy Operator (se disponível)"
                    />
                  </FormGroup>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <TrivyConnectionTest />
                </CardContent>
              </Card>
            </Grid>
            
            {/* Configurações do Kubernetes */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Configurações do Kubernetes" 
                  subheader="Conexão com o cluster Kubernetes/OpenShift"
                />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Caminho do KubeConfig"
                      value={settings.kubernetesSettings.kubeConfigPath}
                      onChange={(e) => handleChange('kubernetesSettings', 'kubeConfigPath', e.target.value)}
                      margin="normal"
                      helperText="Caminho para o arquivo kubeconfig"
                    />
                    
                    <TextField
                      fullWidth
                      label="URL da API"
                      value={settings.kubernetesSettings.apiUrl}
                      onChange={(e) => handleChange('kubernetesSettings', 'apiUrl', e.target.value)}
                      margin="normal"
                      helperText="URL da API do Kubernetes/OpenShift"
                    />
                    
                    <TextField
                      fullWidth
                      label="Token de Acesso"
                      type={showToken ? "text" : "password"}
                      value={settings.kubernetesSettings.token}
                      onChange={(e) => handleChange('kubernetesSettings', 'token', e.target.value)}
                      margin="normal"
                      helperText="Token de autenticação para a API"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle token visibility"
                              onClick={() => setShowToken(!showToken)}
                              edge="end"
                            >
                              {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.kubernetesSettings.verifySSL}
                          onChange={(e) => handleChange('kubernetesSettings', 'verifySSL', e.target.checked)}
                        />
                      }
                      label="Verificar SSL"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={testKubernetesConnection}
                        disabled={testingConnection}
                        startIcon={testingConnection ? <CircularProgress size={20} /> : <InfoIcon />}
                      >
                        Testar Conexão
                      </Button>
                      
                      {connectionStatus && (
                        <Alert 
                          severity={connectionStatus.success ? "success" : "error"}
                          sx={{ mt: 2 }}
                        >
                          {connectionStatus.message}
                        </Alert>
                      )}
                    </Box>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Configurações do Banco de Dados */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Configurações do Banco de Dados" 
                  subheader="Configurações para conexão com o banco de dados"
                />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="String de Conexão"
                      value={settings.databaseSettings.connectionString}
                      onChange={(e) => handleChange('databaseSettings', 'connectionString', e.target.value)}
                      margin="normal"
                      helperText="String de conexão com o banco de dados PostgreSQL"
                      multiline
                      rows={2}
                    />
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                      As alterações de configurações de banco de dados exigem reinicialização 
                      do serviço para serem aplicadas.
                    </Alert>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Configurações de Logging */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Configurações de Logging" 
                  subheader="Defina o nível de detalhamento dos logs"
                />
                <Divider />
                <CardContent>
                  <FormGroup sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Nível de Log"
                      select
                      value={settings.loggingSettings.logLevel}
                      onChange={(e) => handleChange('loggingSettings', 'logLevel', e.target.value)}
                      margin="normal"
                      helperText="Nível de detalhamento dos logs"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="DEBUG">DEBUG</option>
                      <option value="INFO">INFO</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ERROR">ERROR</option>
                    </TextField>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.loggingSettings.debug}
                          onChange={(e) => handleChange('loggingSettings', 'debug', e.target.checked)}
                        />
                      }
                      label="Modo Debug"
                    />
                    
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Habilitar o modo Debug pode afetar o desempenho do sistema. 
                      Use apenas para diagnóstico de problemas.
                    </Alert>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Sobre o Sistema */}
            <Grid item xs={12}>
              <Card>
              <CardHeader 
                  title="Sobre o Sistema" 
                  subheader="Informações sobre a versão atual e componentes"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nome do Sistema:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          WatchShift - Monitor de Conformidade para Kubernetes
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Versão:
                        </Typography>
                        <Typography variant="body1">
                          0.1.0
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ambiente:
                        </Typography>
                        <Typography variant="body1">
                          Desenvolvimento
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Scanner de Vulnerabilidades:
                        </Typography>
                        <Typography variant="body1">
                          Trivy v0.37.2
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Backend:
                        </Typography>
                        <Typography variant="body1">
                          ASP.NET 8.0 / C#
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Frontend:
                        </Typography>
                        <Typography variant="body1">
                          React 19.0.0 / Material UI 6.4.5
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Banco de Dados:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        PostgreSQL (compliancemonitor)
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: 'success.main', 
                        color: 'white', 
                        borderRadius: '16px',
                        px: 1.5, 
                        py: 0.5, 
                        fontSize: '0.75rem' 
                      }}>
                        Conectado
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      API Kubernetes:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        {settings.kubernetesSettings.apiUrl || 'Usando KubeConfig'}
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: connectionStatus?.success ? 'success.main' : 'warning.main', 
                        color: 'white', 
                        borderRadius: '16px',
                        px: 1.5, 
                        py: 0.5, 
                        fontSize: '0.75rem' 
                      }}>
                        {connectionStatus?.success ? 'Conectado' : 'Status Desconhecido'}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status do Sistema:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        Todos os serviços estão operacionais
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: 'success.main', 
                        color: 'white', 
                        borderRadius: '16px',
                        px: 1.5, 
                        py: 0.5, 
                        fontSize: '0.75rem' 
                      }}>
                        Saudável
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Ações de Manutenção */}
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Ações de Manutenção" 
                  subheader="Operações para manutenção do sistema"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Limpar Cache
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Remove os resultados de escaneamento em cache para forçar novos escaneamentos.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={handleClearCache}
                            disabled={isLoading}
                          >
                            Limpar Cache
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Validar Conexões
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Verifica se todas as conexões com serviços externos estão funcionando.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={handleTestAllConnections}
                            disabled={isLoading}
                          >
                            Testar Conexões
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Backup do Banco
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Cria um backup do banco de dados PostgreSQL atual.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={handleDatabaseBackup}
                            disabled={isLoading}
                          >
                            Fazer Backup
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="h6" color="error.dark" gutterBottom>
                      Zona de Perigo
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Button 
                          variant="outlined" 
                          color="error"
                          startIcon={<RefreshIcon />}
                          fullWidth
                          onClick={handleResetSettings}
                          disabled={isLoading}
                        >
                          Redefinir para Padrões
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Button 
                          variant="outlined" 
                          color="error"
                          startIcon={<CancelIcon />}
                          fullWidth
                          onClick={handleClearAllData}
                          disabled={isLoading}
                        >
                          Limpar Todos os Dados
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Backdrop para operações de longa duração */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Processando...</Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default SettingsPage;