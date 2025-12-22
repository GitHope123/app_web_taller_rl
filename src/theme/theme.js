import { createTheme, alpha } from '@mui/material/styles'

// Variables de color
const PRIMARY_MAIN_LIGHT = '#0F172A' // Slate 900
const PRIMARY_LIGHT_LIGHT = '#F1F5F9' // Slate 100
const PRIMARY_DARK_LIGHT = '#020617' // Slate 950

const PRIMARY_MAIN_DARK = '#38BDF8' // Sky 400 (Brighter for Dark Mode)
const PRIMARY_LIGHT_DARK = '#0F172A' // Slate 900
const PRIMARY_DARK_DARK = '#7DD3FC' // Sky 300

const SECONDARY_MAIN = '#0EA5E9' // Sky 500
const SUCCESS_MAIN = '#10B981'
const ERROR_MAIN = '#EF4444'
const WARNING_MAIN = '#F59E0B'
const INFO_MAIN = '#3B82F6'

const getTheme = (mode) => {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? PRIMARY_MAIN_LIGHT : PRIMARY_MAIN_DARK,
        light: isLight ? PRIMARY_LIGHT_LIGHT : 'rgba(56, 189, 248, 0.16)', // Transparent blue for dark mode bg
        dark: isLight ? PRIMARY_DARK_LIGHT : PRIMARY_DARK_DARK,
        contrastText: isLight ? '#ffffff' : '#0F172A',
      },
      secondary: {
        main: SECONDARY_MAIN,
        light: isLight ? '#E0F2FE' : 'rgba(14, 165, 233, 0.16)',
        dark: '#0284C7',
        contrastText: '#ffffff',
      },
      background: {
        default: isLight ? '#F8FAFC' : '#0F172A', // Slate 50 vs Slate 900
        paper: isLight ? '#FFFFFF' : '#1E293B',    // White vs Slate 800
      },
      text: {
        primary: isLight ? '#1E293B' : '#F8FAFC', // Slate 800 vs Slate 50
        secondary: isLight ? '#64748B' : '#94A3B8', // Slate 500 vs Slate 400
        disabled: isLight ? '#94A3B8' : '#64748B',
      },
      divider: isLight ? '#E2E8F0' : '#334155', // Slate 200 vs Slate 700
      success: {
        main: SUCCESS_MAIN,
        light: isLight ? '#D1FAE5' : 'rgba(16, 185, 129, 0.16)',
        dark: '#047857',
      },
      error: {
        main: ERROR_MAIN,
        light: isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.16)',
        dark: '#B91C1C',
      },
      warning: {
        main: WARNING_MAIN,
        light: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.16)',
        dark: '#B45309',
      },
      info: {
        main: INFO_MAIN,
        light: isLight ? '#DBEAFE' : 'rgba(59, 130, 246, 0.16)',
        dark: '#1D4ED8',
      },
      action: {
        hover: isLight ? alpha(PRIMARY_MAIN_LIGHT, 0.04) : alpha('#ffffff', 0.08),
        selected: isLight ? alpha(PRIMARY_MAIN_LIGHT, 0.08) : alpha('#ffffff', 0.16),
        disabled: isLight ? alpha(PRIMARY_MAIN_LIGHT, 0.3) : alpha('#ffffff', 0.3),
        disabledBackground: isLight ? alpha(PRIMARY_MAIN_LIGHT, 0.12) : alpha('#ffffff', 0.12),
      },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.57,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isLight ? '#94A3B8 #F1F5F9' : '#475569 #0F172A',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: isLight ? '#F1F5F9' : '#0F172A',
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isLight ? '#94A3B8' : '#475569',
              minHeight: 24,
              border: isLight ? '2px solid #F1F5F9' : '2px solid #0F172A',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: isLight
                ? '0 4px 12px rgba(15, 23, 42, 0.15)'
                : '0 4px 12px rgba(56, 189, 248, 0.25)',
            },
          },
          containedPrimary: {
            backgroundColor: isLight ? PRIMARY_MAIN_LIGHT : PRIMARY_MAIN_DARK,
            color: isLight ? '#ffffff' : '#0F172A',
            '&:hover': {
              backgroundColor: isLight ? PRIMARY_LIGHT_LIGHT : PRIMARY_DARK_DARK,
            },
          },
          outlined: {
            borderColor: isLight ? '#E2E8F0' : '#334155',
            '&:hover': {
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isLight ? PRIMARY_MAIN_LIGHT : PRIMARY_MAIN_DARK,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isLight
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
            border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            backgroundImage: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: isLight
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isLight
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
              : 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
              '& fieldset': {
                borderColor: isLight ? '#E2E8F0' : '#334155',
              },
              '&:hover fieldset': {
                borderColor: isLight ? '#94A3B8' : '#64748B',
              },
              '&.Mui-focused fieldset': {
                borderColor: isLight ? PRIMARY_MAIN_LIGHT : PRIMARY_MAIN_DARK,
                borderWidth: 1,
                boxShadow: `0 0 0 3px ${isLight ? alpha(PRIMARY_MAIN_LIGHT, 0.1) : alpha(PRIMARY_MAIN_DARK, 0.15)}`,
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isLight ? '#F8FAFC' : '#0F172A',
            color: isLight ? '#475569' : '#94A3B8',
            borderBottom: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
          },
          body: {
            color: isLight ? '#334155' : '#E2E8F0',
            borderBottom: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td, &:last-child th': {
              border: 0,
            },
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
            color: isLight ? '#1E293B' : '#F8FAFC',
            boxShadow: 'none',
            borderBottom: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isLight ? '#E2E8F0' : '#334155',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: isLight ? '#64748B' : '#94A3B8',
            minWidth: 40,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#E2E8F0' : '#334155',
            color: isLight ? '#475569' : '#E2E8F0',
            fontWeight: 600,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
          filled: {
            backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  })
}

export default getTheme
