import React, { forwardRef } from 'react';
import { Dialog, Slide, alpha, useTheme } from '@mui/material';

// Transición suave al aparecer
const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ModernDialog
 * Componente reutilizable para modales con efecto "Glassmorphism" en el fondo (backdrop)
 * y un diseño moderno.
 * 
 * @param {object} props - Props normales de Material UI Dialog
 */
const ModernDialog = ({ children, PaperProps, ...props }) => {
    const theme = useTheme();

    return (
        <Dialog
            TransitionComponent={Transition}
            {...props}
            // Personalización del Backdrop (Fondo oscuro borroso)
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)', // Efecto borroso
                        backgroundColor: alpha(theme.palette.background.default, 0.4), // Fondo semitransparente basado en el tema
                    }
                }
            }}
            // Personalización de la ventana modal
            PaperProps={{
                elevation: 24,
                sx: {
                    borderRadius: 4, // Bordes más redondeados
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundImage: 'none',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    ...PaperProps?.sx
                },
                ...PaperProps
            }}
        >
            {children}
        </Dialog>
    );
};

export default ModernDialog;
