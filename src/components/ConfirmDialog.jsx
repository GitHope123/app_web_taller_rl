import { DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'
import ModernDialog from './ModernDialog'

/**
 * Dialogo de confirmación genérico
 * @param {boolean} open - Si el dialogo está abierto
 * @param {string} title - Título del dialogo
 * @param {string} content - Mensaje de contenido
 * @param {function} onConfirm - Función al confirmar
 * @param {function} onCancel - Función al cancelar
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} cancelText - Texto del botón cancelar
 */
const ConfirmDialog = ({
    open,
    title = 'Confirmar Acción',
    content = '¿Estás seguro de continuar?',
    onConfirm,
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    return (
        <ModernDialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                {title}
            </DialogTitle>
            <DialogContent dividers>
                <Typography>{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
                    {confirmText}
                </Button>
            </DialogActions>
        </ModernDialog>
    )
}

export default ConfirmDialog
