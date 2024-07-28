"use client";
import { useUser } from '../../lib/UserContext';
import { Box, Typography, Avatar, Button } from '@mui/material';

export default function Profile() {
  const { user } = useUser();

  if (!user) {
    return <Typography>You must be logged in to view this page.</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Avatar alt={user.name} src={user.picture} sx={{ width: 100, height: 100, mb: 2 }} />
      <Typography variant="h4">{user.name}</Typography>
      <Typography variant="body1">{user.email}</Typography>
    </Box>
  );
}
