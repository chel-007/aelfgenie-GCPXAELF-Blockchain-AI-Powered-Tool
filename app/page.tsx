"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Avatar, Popover } from '@mui/material';
import { GoogleLogin, jwtDecode } from '../lib/googleAuth';
import { toast } from 'react-toastify';
import { useUser } from '../lib/UserContext';
import { useRouter } from 'next/navigation';
import useAuth from '../lib/useAuth';
import SmartContractGenerator from './components/SmartContractGenerator';
import DeploySmartContract from './components/DeploySmartContract';
import ExploreChain from './components/ExploreChain';
import { useDialogflow } from '../lib//DialogflowContext';
import { sendMessageToDialogflow } from '../lib/dialogflowUtils';
import useTypingEffect from './components/useTypingEffect';
import "./globals.css";


export default function Home() {
  useAuth();
  const { user, setUser } = useUser();
  const [activeSection, setActiveSection] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const [showGenerator, setShowGenerator] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [showExploration, setShowExploration] = useState(false)
  const { setResponseMessage } = useDialogflow();
  const { responseMessage } = useDialogflow();
  const typedResponseMessage = useTypingEffect(responseMessage);

  const handleProfileClick = () => router.push('/profile');

  const handleLoginSuccess = (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    setUser(decoded);
  
    const token = response.credential;
    const expirationTime = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  
    toast.success('Sign in successful!');
  };
  

  const handleLoginFailure = () => toast.error('Sign in failed!');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');
  };
  
  useEffect(() => {
    if (!user) {
      setShowGenerator(false);
      setShowDeployment(false);
      setShowExploration(false);
      setActiveSection('');
    }
  }, [user]);

  const handleSectionClick = (section: string) => {
    if (!user) {
      toast.error('You must sign in first!');
      return;
    }
    setActiveSection(section);
    if (section === 'generate') {
      setShowGenerator(true);
      setShowDeployment(false);
      setShowExploration(false);
    } else if (section === 'deploy') {
      setShowDeployment(true);
      setShowGenerator(false);
      setShowExploration(false);
    } 
      else if (section === 'explore') {
      setShowExploration(true);
      setShowDeployment(false);
      setShowGenerator(false);
    } else {
      setShowGenerator(false);
      setShowDeployment(false);
    }

    let message = '';
    switch (section) {
      case 'generate':
        message = 'first option';
        break;
      case 'optimize':
        message = 'second option';
        break;
      case 'deploy':
        message = 'third option';
        break;
      case 'explore':
        message = 'fourth option';
        break;
      default:
        message = 'Unknown action.';
        break;
    }

    handleOptionSwitch(message);
  };

  async function handleOptionSwitch(description: string) {
    try {
      const response = await sendMessageToDialogflow(description);
      setResponseMessage(response);
  
    } catch (error) {
      console.error('Error handling section click:', error);
      setResponseMessage('Error communicating with Dialogflow.');
    }
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'start',
      backgroundColor: '#1a2138',
      padding: '20px'
    }}>

      {/* <AnimatedPaper/> */}
      
      <Box sx={{
        bgcolor: 'black',
        color: 'white',
        p: 3,
        pr: 12,
        pl: 12,
        borderRadius: 50,
        textAlign: 'center',
        mb: 2,
        mt: 2,
      }}>
        <Typography className='font-mono font-bold' variant="h4" component="h1">
          (a)elf Genie
        </Typography>
      </Box>


      <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 4 }}>
        {['generate', 'optimize', 'deploy', 'explore'].map((section) => (
          <Button
            key={section}
            className="button font-mono font-bold p-6 rounded-lg pl-10 pr-10"
            variant="contained"
            color={section === 'generate' ? 'error' : section === 'optimize' ? 'secondary' : section === 'deploy' ? 'success' : 'info'}
            onClick={() => handleSectionClick(section)}
            sx={{  }}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        ))}
      </Box>

      <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      mt: 2,
      gap: 2, // Add space between the icon and text field
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: '50%',
        width: 60,
        height: 60,
        backgroundColor: 'white',
        boxShadow: 3,
      }}>
        <Typography className='font-mono' variant="h6" component="h2" fontSize={8}>
          Dialogflow
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'transparent',
        p: 2, // Adjust the padding as needed
        borderRadius: 2,
        boxShadow: 3,
        width: '500px', // Adjust the width as needed
        height: '60px', // Adjust the height as needed
        overflow: 'hidden', // Hide overflow content
        textAlign: 'left', // Align the text to the left
      }}>
        <Typography variant="body1" component="p" style={{ color: 'black' }}>
          {typedResponseMessage ? typedResponseMessage : '...'}
        </Typography>
      </Box>
    </Box>

      {showGenerator && <SmartContractGenerator />}

        {activeSection === 'optimize' && (
          <Box
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              boxShadow: 3,
              width: '80%',
              maxWidth: '600px',
              mt: 2,
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Optimize Smart Contract
            </Typography>
            <Typography>
              Analyze your smart contract code for optimization opportunities and potential issues.
            </Typography>
          </Box>
        )}

        {showDeployment && <DeploySmartContract />}

        {showExploration && <ExploreChain />}

      {user ? (
        <Box 
          className='flex backdrop-filter text-xs opacity-50 backdrop-blur-sm bg-gray-400 p-1 rounded-lg' 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            position: 'absolute',
            top: 160,
            right: 200,
            alignItems: 'center', 
            gap: 1, 
            padding: '10px', 
            border: '2px solid #000000', 
            backgroundColor: 'grey', 
          }}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          <Avatar alt={user.name} src={user.picture} />
          <Typography variant="body2">{user.name}</Typography>
          <Popover
            sx={{ pointerEvents: 'auto', cursor: 'pointer' }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={handlePopoverClose}
            onMouseLeave={handlePopoverClose}
            disableRestoreFocus
          >
            <Typography className='font-mono' sx={{ p: 2 }} onClick={handleProfileClick}>
              profile
            </Typography>
            <Typography className='font-mono' sx={{ p: 2 }} onMouseLeave={handlePopoverClose} onClick={handleLogout}>
              logout
            </Typography>
          </Popover>
        </Box>
      ) : (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 10,
          mb: 2,
          fontFamily: 'monospace',
          fontSize: '10px',
        }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />
        </Box>
      )}
    </main>
  );
}