import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
  Chip,
  Typography,
  Divider,
  Alert
} from '@mui/material';

const PolicyForm = ({ open, onClose, policy, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'MEDIUM',
    ruleType: 'SecurityContextConstraint',
    ruleName: '',
    parameters: {}
  });

  const [errors, setErrors] = useState({});

  const severityOptions = [
    { value: 'CRITICAL', label: 'Crítica' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'LOW', label: 'Baixa' }
  ];

  const ruleTypeOptions = [
    { value: 'SecurityContextConstraint', label: 'Security Context Constraints' },
    { value: 'Rbac', label: 'RBAC' },
    { value: 'NetworkPolicy', label: 'Network Policy' },
    { value: 'PodSecurity', label: 'Pod Security' }
  ];

  const ruleNameOptions = {
    SecurityContextConstraint: [
      { value: 'privileged_containers', label: 'Containers Privilegiados Proibidos' }
    ],
    Rbac: [
      { value: 'cluster_admin', label: 'Restrição de cluster-admin' },
      { value: 'wildcard_permissions', label: 'Permissões Wildcard Proibidas' }
    ],
    NetworkPolicy: [
      { value: 'default_deny', label: 'Default Deny Network Policy' }
    ],
    PodSecurity: [
      { value: 'host_network', label: 'Host Network Proibido' },
      { value: 'host_pid', label: 'Host PID Proibido' }
    ]
  };

  useEffect(() => {
    if (policy) {
      const ruleName = policy.parameters?.rule_name || '';
      
      setFormData({
        name: policy.name || '',
        description: policy.description || '',
        severity: policy.severity || 'MEDIUM',
        ruleType: policy.ruleType || 'SecurityContextConstraint',
        ruleName: ruleName,
        parameters: { ...policy.parameters } || {}
      });
    } else {
      setFormData({
        name: '',
        description: '',
        severity: 'MEDIUM',
        ruleType: 'SecurityContextConstraint',
        ruleName: '',
        parameters: {}
      });
    }
    
    setErrors({});
  }, [policy, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ruleType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ruleName: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.ruleName.trim()) newErrors.ruleName = 'Nome da regra é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const apiData = {
        name: formData.name,
        description: formData.description,
        severity: formData.severity,
        ruleType: formData.ruleType,
        ruleName: formData.ruleName,
        parameters: { 
          ...formData.parameters,
          rule_name: formData.ruleName 
        }
      };
      
      onSubmit(apiData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {policy ? 'Editar Política' : 'Nova Política'}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Box>
          <TextField
            fullWidth
            margin="normal"
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            autoFocus
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Severidade</InputLabel>
            <Select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              label="Severidade"
            >
              {severityOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={option.label}
                      size="small"
                      color={getSeverityColor(option.value)}
                      sx={{ mr: 1, minWidth: 60 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Regra</InputLabel>
            <Select
              name="ruleType"
              value={formData.ruleType}
              onChange={handleChange}
              label="Tipo de Regra"
            >
              {ruleTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Selecione o tipo de recurso Kubernetes a ser validado
            </FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal" error={!!errors.ruleName}>
            <InputLabel>Nome da Regra</InputLabel>
            <Select
              name="ruleName"
              value={formData.ruleName}
              onChange={handleChange}
              label="Nome da Regra"
              disabled={!formData.ruleType || !ruleNameOptions[formData.ruleType]}
            >
              {formData.ruleType && ruleNameOptions[formData.ruleType] && 
                ruleNameOptions[formData.ruleType].map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
              ))}
            </Select>
            {errors.ruleName && (
              <FormHelperText error>{errors.ruleName}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              Os parâmetros adicionais serão configurados automaticamente com base no tipo e nome da regra.
            </Alert>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {policy ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getSeverityColor = (severity) => {
  switch (severity) {
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

export default PolicyForm;