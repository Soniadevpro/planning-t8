import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarToday,
  SwapHoriz,
  Person,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin, isSuperviseur, isAgent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = () => {
    if (isAdmin()) return 'error';
    if (isSuperviseur()) return 'warning';
    return 'primary';
  };

  const getRoleLabel = () => {
    if (isAdmin()) return 'Administrateur';
    if (isSuperviseur()) return 'Superviseur';
    return 'Agent';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          mb: 4,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.dark', width: 48, height: 48 }}>
                <DashboardIcon />
              </Avatar>
              
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Planning T8
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Tableau de bord
                </Typography>
              </Box>
            </Box>

            <Button
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Déconnexion
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Informations utilisateur */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                <Person fontSize="large" />
              </Avatar>
              
              <Box flex={1}>
                <Typography variant="h5" gutterBottom>
                  Bienvenue, {user?.first_name || user?.username} !
                </Typography>
                
                <Box display="flex" gap={1} alignItems="center">
                  <Chip
                    label={getRoleLabel()}
                    color={getRoleColor()}
                    size="small"
                  />
                  
                  {user?.matricule && (
                    <Chip
                      label={`Matricule: ${user.matricule}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Dernière connexion: {new Date().toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Actions rapides
        </Typography>

        <Grid container spacing={3}>
          {/* Planning */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => navigate('/planning')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  <CalendarToday fontSize="large" />
                </Avatar>
                
                <Typography variant="h6" gutterBottom>
                  Planning
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Consultez vos plannings et horaires
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Échanges */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => navigate('/exchanges')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'secondary.main',
                  }}
                >
                  <SwapHoriz fontSize="large" />
                </Avatar>
                
                <Typography variant="h6" gutterBottom>
                  Échanges
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Gérez vos demandes d'échange
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Profil */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => navigate('/profile')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'success.main',
                  }}
                >
                  <Person fontSize="large" />
                </Avatar>
                
                <Typography variant="h6" gutterBottom>
                  Mon Profil
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Modifiez vos informations personnelles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Statistiques rapides */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Aperçu rapide
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Services ce mois
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Demandes en cours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Échanges validés
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jours de repos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;