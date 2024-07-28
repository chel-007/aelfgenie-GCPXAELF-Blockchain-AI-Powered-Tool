import React, { useRef, useState, useContext } from 'react';
import {
  Box,
  Breadcrumbs,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Container,
} from '@mui/material';
import { CheckCircle, Help, ArrowForward } from '@mui/icons-material';
import { DeployContractContext } from '@/lib/DeployContractContext';
import { useDialogflow } from '../../lib/DialogflowContext';
import { sendMessageToDialogflow } from '../../lib/dialogflowUtils';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Link as MuiLink, TextField } from '@mui/material';

const steps = ['Start', 'Configure', 'Deploy', 'Troubleshoot'] as const;
type Step = typeof steps[number];

const quickReplies: Record<Step, { text: string; color: string; hoverColor: string; selectedColor: string; isLink?: boolean; isInput?: boolean }[]> = {
  Start: [
    { text: 'Check Tools', color: '#1e88e5', hoverColor: '#1565c0', selectedColor: '#556280' },
    { text: 'Requirements', color: '#d32f2f', hoverColor: '#c62828', selectedColor: '#806155' },
  ],
  Configure: [
    { text: 'Go to Playground', color: '#388e3c', hoverColor: '#2e7d32', selectedColor: '#568053', isLink: true },
    { text: 'Setup aelf deploy', color: '#fbc02d', hoverColor: '#f9a825', selectedColor: '#807a53' },
  ],
  Deploy: [
    { text: 'Deploy via CLI', color: '#484b52', hoverColor: '#d84315', selectedColor: '#0d47a1', isInput: true },
  ],
  Troubleshoot: [
    { text: 'Common Issues', color: '#7b1fa2', hoverColor: '#6a1b9a', selectedColor: '#0d47a1' },
    { text: 'Provide Description', color: '#c2185b', hoverColor: '#ad1457', selectedColor: '#0d47a1' },
  ]
};


interface DialogflowReply {
  head: string;
  body: string;
}

interface FormattedResponse {
  mainResponse: string;
  reply: DialogflowReply[];
}

const formatDialogflowResponse = (response: string): FormattedResponse => {
  const lines = response.split('\n').map((line: string) => line.trim()).filter((line: string) => line !== '');
  const mainResponse = lines[0];
  const reply: DialogflowReply[] = [];

  for (let i = 1; i < lines.length; i += 2) {
    reply.push({
      head: lines[i],
      body: lines[i + 1] || '', // Ensure that the body is an empty string if it doesn't exist
    });
  }

  console.log(reply);
  return { mainResponse, reply };
};

const DeploySmartContract = () => {
  const context = useContext(DeployContractContext);
  const [activeStep, setActiveStep] = useState(0);
  const [activeFlow, setActiveFlow] = useState<string | null>(null); // State to track active flow
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResponseMessage } = useDialogflow();
  const [carouselItems, setCarouselItems] = useState<{ head: string; body: string }[]>([]);
  const [showIcons, setShowIcons] = useState(false);
  const router = useRouter();
  const [detailedResponse, setDetailedResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!context) {
    throw new Error('DeploySmartContract must be used within a DeployContractProvider');
  }

  const handleQuickReplyFlow = async (reply: string) => {
    setIsLoading(true);
    setError(null);
    setShowIcons(false); // Hide icons initially
    setCarouselItems([]);
    setDetailedResponse(null);

    try {
      const response = await sendMessageToDialogflow(reply, false);
      const { mainResponse, reply: formattedReply } = formatDialogflowResponse(response);
      setResponseMessage(mainResponse);
      setCarouselItems(formattedReply);
      setIsLoading(false);

      if (formattedReply.length > 0) {
        setTimeout(() => setShowIcons(true), 2000); // Show icons after 5 seconds only if there are carousel items
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError('Error sending message to Dialogflow');
      toast.error('Error sending message to Dialogflow');
    }
  };
  const handleDetailedReplyFlow = async (reply: string) => {
    setIsLoading(true);
    setError(null);
    console.log(reply);
    try {
      const response = await sendMessageToDialogflow(reply, true);
      setDetailedResponse(response); // Set the detailed response
      console.log(response);
      if (response) {
        setTimeout(() => setShowIcons(true), 2000); // Show icons after 5 seconds only if there are carousel items
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError('Error sending message to Dialogflow');
      toast.error('Error sending message to Dialogflow');
    }
  };

  const { state, dispatch } = context;


  const handleQuickReply = (reply: string) => {
    console.log(`Quick reply selected: ${reply}`);
    setActiveFlow(reply); // Set the active flow
    setDetailedResponse(null);
    handleQuickReplyFlow(reply);
  };

  const handleCheck = () => {
  
    if (activeFlow == 'Check Tools') {
      const nextStep = 'Requirements';
      handleQuickReply(nextStep);
    }
    if (activeFlow == 'Requirements') {
      const nextStep = steps.indexOf(state.currentStep) + 1;
      handleStepClick(nextStep);
    }
    if (activeFlow == 'Setup aelf deploy') {
      const nextStep = steps.indexOf(state.currentStep) + 1;
      handleStepClick(nextStep);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    dispatch({ type: 'SET_STEP', payload: steps[stepIndex] });
    setActiveFlow(null);
    setCarouselItems([]); 
    setDetailedResponse(null);
  };

  return (
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
        Deploy Smart Contract
      </Typography>

      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ marginBottom: '20px' }}>
          {steps.map((step) => (
            <Typography
              key={step}
              sx={{
                color:
                  steps.indexOf(step) <= steps.indexOf(state.currentStep)
                    ? 'primary.main'
                    : 'text.secondary',
                fontWeight: 'bold',
              }}
            >
              {step}
            </Typography>
          ))}
        </Breadcrumbs>

        <Stepper activeStep={steps.indexOf(state.currentStep)} sx={{ width: '100%' }} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => handleStepClick(index)}>
              <StepLabel
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
              >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>

      <div style={{ marginTop: '20px' }}>
        <Card sx={{ backgroundColor: '#1a2138', color: '#fff' }}>
          <CardContent sx={{ textAlign: 'center', marginBottom: '0' }}>
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'center' }}>
            {quickReplies[state.currentStep as Step].map((reply) => (
                reply.isLink ? (
                  <Link key={reply.text} href="/playground" passHref>
                    <MuiLink sx={{ display: 'flex', alignItems: 'center', mt: 2, color: reply.color }}>
                      {reply.text}
                      <ArrowForward sx={{ ml: 1 }} />
                    </MuiLink>
                  </Link>
                ) : reply.isInput ? (
                  <Box key={reply.text} sx={{ display: 'flex', alignItems: 'center', margin: '5px', width: '80%', height: '10%' }}>
                    <TextField
                    inputRef={inputRef}
                      placeholder="ask me anything about aelf deployment"
                      variant="outlined"
                      multiline
                      fullWidth
                      inputProps={{ maxLength: 200, style: { whiteSpace: 'pre-line' } }}
                      sx={{
                        mb: 2,
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        width: '80%',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'white',
                          },
                          '&:hover fieldset': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#000',
                          '&.Mui-focused': {
                            color: '#fff',
                            backgroundColor: 'transparent',
                            fontSize: '1rem',
                          },
                        },
                      }}
                    />
                     <Button
                      variant="contained"
                      sx={{
                        marginLeft: '5px',
                        backgroundColor: reply.color,
                        '&:hover': {
                          backgroundColor: reply.hoverColor,
                        },
                      }}
                      onClick={() => {
                        if (inputRef.current) {
                          handleDetailedReplyFlow(inputRef.current.value);
                        }
                      }}
                    >
                      Sendo
                    </Button>
                  </Box>
                ) : (
                  <Button
                    key={reply.text}
                    variant="contained"
                    sx={{
                      margin: '5px',
                      padding: '10px 20px',
                      color: '#fff',
                      backgroundColor: activeFlow === reply.text ? reply.selectedColor : reply.color,
                      '&:hover': {
                        backgroundColor: reply.hoverColor,
                      },
                    }}
                    onClick={() => {
                      if (reply.text === 'Setup aelf deploy') {
                        handleDetailedReplyFlow('what is the full workflow to download aelf deploy tool');
                        handleQuickReply(reply.text);
                      } else if (reply.text === 'Common Issues') {
                        handleDetailedReplyFlow('can you list about 5 common issues faced during aelf development');
                        handleQuickReply(reply.text);
                      }
                      else {
                        handleQuickReply(reply.text);
                      }
                    }}
                  >
                    {reply.text}
                  </Button>
                )
              ))}

       </div>
       {isLoading && <Typography variant="body2">Loading...</Typography>}
          {detailedResponse && (
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Detailed Response"
          multiline
          fullWidth
          rows={4}
          value={detailedResponse}
          variant="outlined"
        />
      </Box>
    )}
          </CardContent>
          <div>
        {carouselItems.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
            {carouselItems.map((item, index) => (
              <Card key={index} sx={{ maxWidth: 250, margin: '10px' }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {item.head}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {showIcons && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        {activeFlow === 'Requirements' && (
          <>
            <IconButton onClick={handleCheck}>
              <CheckCircle style={{ color: '#4caf50', fontSize: '40px' }} />
            </IconButton>
          </>
        )}
        {activeFlow === 'Check Tools' && (
          <IconButton onClick={handleCheck}>
            <CheckCircle style={{ color: '#4caf50', fontSize: '40px' }} />
          </IconButton>
        )}
        {activeFlow === 'Setup aelf deploy' && (
          <IconButton onClick={handleCheck}>
            <CheckCircle style={{ color: '#4caf50', fontSize: '40px' }} />
          </IconButton>
        )}

        </div>
      )}

        </Card>
      </div>
    </Box>
  );
};

export default DeploySmartContract;
