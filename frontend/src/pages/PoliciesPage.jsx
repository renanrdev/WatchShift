import React, { useState } from 'react';
import PolicyForm from '../components/policies/PolicyForm';
import { useConfigAuditReports } from '../hooks/useCompliance';
import {
    Box, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Button, Chip, IconButton, Tooltip, CircularProgress,
    Alert, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle
} from '@mui/material';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as EnabledIcon,
    Cancel as DisabledIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

import Header from '../components/common/Header';
import { usePolicies, useUpdatePolicy, useDeletePolicy, useCreatePolicy } from '../hooks/usePolicies';

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

const PoliciesPage = () => {
    const [formOpen, setFormOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState(null);
    const { data: policies, isLoading, refetch } = usePolicies();
    const { data: configAuditReports, isLoading: isLoadingReports } = useConfigAuditReports();
    const createPolicyMutation = useCreatePolicy();
    const updatePolicyMutation = useUpdatePolicy();
    const deletePolicyMutation = useDeletePolicy();

    const handleRefresh = () => {
        refetch();
    };

    const handleOpenDeleteConfirm = (id) => {
        setPolicyToDelete(id);
        setConfirmDialogOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (policyToDelete) {
            deletePolicyMutation.mutate(policyToDelete, {
                onSuccess: () => {
                    setConfirmDialogOpen(false);
                    setPolicyToDelete(null);
                }
            });
        }
    };

    const handleToggleEnabled = (id, currentEnabled) => {
        updatePolicyMutation.mutate({
            id,
            data: { enabled: !currentEnabled }
        });
    };

    const handleOpenForm = (policy = null) => {
        setSelectedPolicy(policy);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelectedPolicy(null);
    };

    const handleSubmitPolicy = (policyData) => {
        if (selectedPolicy) {
            // Editar política existente
            updatePolicyMutation.mutate({
                id: selectedPolicy.id,
                data: policyData
            }, {
                onSuccess: () => {
                    handleCloseForm();
                }
            });
        } else {
            // Criar nova política
            createPolicyMutation.mutate(policyData, {
                onSuccess: () => {
                    handleCloseForm();
                }
            });
        }
    };

    // Estado de carregamento
    if (isLoading) {
        return (
            <>
                <Header title="Políticas de Conformidade" />
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

    return (
        <>
            <Header title="Políticas de Conformidade" onRefresh={handleRefresh} />
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">
                            Gerenciar Políticas
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            color="primary"
                            onClick={() => handleOpenForm()}
                        >
                            Nova Política
                        </Button>
                    </Box>

                    {/* Status das políticas */}
                    {configAuditReports && configAuditReports.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Relatório de Auditoria de Configuração
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                {configAuditReports.map((report, index) => (
                                    <Chip 
                                        key={index}
                                        label={`${report.name}: ${report.checks.length} verificações`}
                                        color={report.criticalCount + report.highCount > 0 ? 'error' : 'default'}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Severidade</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {policies?.map((policy) => (
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
                                                    icon={<EnabledIcon />}
                                                    label="Ativo"
                                                    color="success"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<DisabledIcon />}
                                                    label="Inativo"
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => handleOpenForm(policy)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={policy.enabled ? "Desativar" : "Ativar"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleEnabled(policy.id, policy.enabled)}
                                                        disabled={updatePolicyMutation.isLoading}
                                                    >
                                                        {policy.enabled ? (
                                                            <DisabledIcon fontSize="small" />
                                                        ) : (
                                                            <EnabledIcon fontSize="small" color="success" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Excluir">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleOpenDeleteConfirm(policy.id)}
                                                        disabled={deletePolicyMutation.isLoading}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!policies || policies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Nenhuma política encontrada
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </Box>

            {/* Formulário de Política */}
            <PolicyForm
                open={formOpen}
                onClose={handleCloseForm}
                policy={selectedPolicy}
                onSubmit={handleSubmitPolicy}
                isLoading={createPolicyMutation.isLoading || updatePolicyMutation.isLoading}
            />

            {/* Diálogo de confirmação de exclusão */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir esta política? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                        disabled={deletePolicyMutation.isLoading}
                    >
                        {deletePolicyMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            "Excluir"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PoliciesPage;