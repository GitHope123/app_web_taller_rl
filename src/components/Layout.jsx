import { useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { authService } from '../services/authService'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    Avatar,
    Chip,
} from '@mui/material'
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Payment as PaymentIcon,
    Work as WorkIcon,
    Logout as LogoutIcon,
    ChevronLeft as ChevronLeftIcon,
    Brightness7 as Brightness7Icon,
    Brightness4 as Brightness4Icon,
    PersonAdd as PersonAddIcon,
    Person as PersonIcon,
} from '@mui/icons-material'
import { ColorModeContext } from '../App'

import { useAuthStore } from '../store/useAuthStore'

const drawerWidth = 240

function Layout() {
    const navigate = useNavigate()
    const location = useLocation()
    const theme = useTheme()
    const colorMode = useContext(ColorModeContext)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [open, setOpen] = useState(true)

    const { user, logout } = useAuthStore()

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleDrawerOpen = () => {
        setOpen(true)
    }

    const handleDrawerClose = () => {
        setOpen(false)
    }

    const handleLogout = () => {
        logout()
        authService.logout()
        navigate('/login', { replace: true })
    }

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
        { text: 'Registros', icon: <WorkIcon />, path: '/registros' },
        { text: 'Pedidos', icon: <PaymentIcon />, path: '/pedidos' },
    ]

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    px: open ? 3 : 1,
                    minHeight: '64px !important',
                }}
            >
                {open ? (
                    <Box
                        component="img"
                        src={theme.palette.mode === 'dark'
                            ? '/src/assets/logo_dark_150x50.svg'
                            : '/src/assets/logo_light_150x50.svg'
                        }
                        alt="R&L Taller Logo"
                        sx={{
                            height: 50,
                            width: 'auto',
                            maxWidth: '150px',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <Box
                        component="img"
                        src={theme.palette.mode === 'dark'
                            ? '/src/assets/logo_dark_48x48.svg'
                            : '/src/assets/logo_light_48x48.svg'
                        }
                        alt="R&L Icon"
                        sx={{
                            width: 48,
                            height: 48,
                            objectFit: 'contain',
                        }}
                    />
                )}
                {open && (
                    <IconButton
                        onClick={handleDrawerClose}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            <List sx={{ px: 2, py: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const isSelected = location.pathname === item.path
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                selected={isSelected}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    borderRadius: 1,
                                    backgroundColor: isSelected
                                        ? theme.palette.mode === 'dark'
                                            ? 'rgba(144, 202, 249, 0.12)'
                                            : 'rgba(25, 118, 210, 0.08)'
                                        : 'transparent',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.08)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                        transform: 'translateX(4px)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: isSelected ? 'primary.main' : 'text.secondary',
                                        transition: 'color 0.25s ease',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        '& .MuiTypography-root': {
                                            fontWeight: isSelected ? 600 : 400,
                                            fontSize: '0.95rem',
                                            color: isSelected ? 'primary.main' : 'text.primary',
                                            transition: 'color 0.25s ease',
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            borderRadius: 1,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(244, 67, 54, 0.12)'
                                    : 'rgba(211, 47, 47, 0.08)',
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 2 : 'auto',
                                justifyContent: 'center',
                                color: 'error.main',
                                transition: 'transform 0.25s ease',
                            }}
                        >
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Cerrar Sesión"
                            sx={{
                                opacity: open ? 1 : 0,
                                '& .MuiTypography-root': {
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: 'error.main',
                                }
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${open ? drawerWidth : 65}px)` },
                    ml: { sm: `${open ? drawerWidth : 65}px` },
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={open ? handleDrawerClose : handleDrawerOpen}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'text.secondary' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        edge="start"
                        onClick={open ? handleDrawerClose : handleDrawerOpen}
                        sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            fontSize: '1.125rem',
                            flexGrow: 1
                        }}
                    >
                        {menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
                    </Typography>

                    {user && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mr: 1,
                            }}
                        >
                            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.primary',
                                        fontWeight: 500,
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {user.nombre} {user.apellido}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.8125rem',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {user.rol || 'Usuario'}
                                </Typography>
                            </Box>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                            </Avatar>
                        </Box>
                    )}

                    <IconButton 
                        sx={{ ml: 1, color: 'text.secondary' }} 
                        onClick={colorMode.toggleColorMode}
                    >
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: open ? drawerWidth : 65 }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: open ? drawerWidth : 65,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden',
                        },
                    }}
                    open={open}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${open ? drawerWidth : 65}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}

export default Layout