import { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';
import { useSmartContract } from '../../lib/SmartContractContext';
import { useDialogflow } from '../../lib/DialogflowContext';
import { sendMessageToDialogflow } from '../../lib/dialogflowUtils';

const SmartContractGenerator = () => {
  const {
    inputValue,
    setInputValue,
    generatedCode,
    setGeneratedCode,
    features,
    setFeatures,
    featuresReceived,
    setFeaturesReceived,
    selectedFeatures,
    setSelectedFeatures,
  } = useSmartContract();

  const { setResponseMessage } = useDialogflow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const axios = require("axios").default;
  const initialText = "A contract that ";

  const maxCharacters = 250;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure the user cannot remove the pre-filled text
    const newValue = event.target.value;
    // Ensure the user cannot remove the pre-filled text
    if (newValue.startsWith(initialText)) {
      setInputValue(newValue);
    } else {
      setInputValue(initialText);
    }
  };

  const handleCopy = (text: any) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      toast.error('Failed to copy');
    });
  };

  const handleGenerateSmartContract = async () => {
    setIsLoading(true);
    setError(null);
  
    const combinedInput = `${inputValue}`;
  
    try {
      let generatedCode = await generateSmartContract(combinedInput);
      let codeMatch = generatedCode.match(/```csharp(?:\w+\n)?([\s\S]*?)```/);
      let retryCount = 0;
  
      // Retry logic
      while (!codeMatch && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
        generatedCode = await generateSmartContract(combinedInput);
        codeMatch = generatedCode.match(/```csharp(?:\w+\n)?([\s\S]*?)```/);
        retryCount++;
      }
  
      // If match found, use the extracted code, otherwise use the original response
      const extractedCode = codeMatch ? codeMatch[1].trim() : generatedCode;
  
      setGeneratedCode(extractedCode);

      const dflResponse = await sendMessageToDialogflow('succesOptionUI1');
      setResponseMessage(dflResponse);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError('Error generating smart contract');
      toast.error('Error generating smart contract');
    }
  };
  
  

  async function generateSmartContract(description: string) {

    const modifiedDescription = description.startsWith('A ') ? description.slice(2) : description;
    const instruction = `can you create a C# complex aelf blockchain ${modifiedDescription}`;

    console.log(instruction)

    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/text/code_generation",
      headers: {
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDQzNjJjMTItZmUyMi00Y2RmLTgzYjUtY2FmOGY4NDFlZmEyIiwidHlwZSI6ImFwaV90b2tlbiJ9.8k0fDgF28RvmqweFMpdU_EQb9e_Xg7_loGdacacjcAE",
      },
      data: {
        providers: "openai",
        prompt: '',
        instruction: instruction,
        temperature: 0.14,
        max_tokens: 4096,
      },
    };
  
    try {
      const response = await axios.request(options);

      console.log(response.data.openai.generated_text)

      return response.data.openai.generated_text;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  

  

  const handleSendDescription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendMessageToDialogflow(inputValue);
      const { mainResponse, features } = formatDialogflowResponse(response);
      setResponseMessage(mainResponse);
      setFeatures(features);
      setFeaturesReceived(true);
      setIsLoading(false);
    } catch (error) {

      console.log(error)
      setIsLoading(false);
      setError('Error sending description to Dialogflow');
      toast.error('Error sending description to Dialogflow');
    }
  };

  const formatDialogflowResponse = (response: string) => {
    // Extracting the main response and features
    const lines = response.split('\n');
    const mainResponse = lines[0]; // The original response
    const featureLines = lines.slice(1); // Features

    // Parsing features
    const features = featureLines.map((line: string) => {
      const featureMatch = line.match(/Feature: (.+) - (.+)/);
      return featureMatch ? featureMatch[2] : '';
    }).filter(feature => feature !== '');

    return { mainResponse, features };
  };

  const handleFeatureSelect = (feature: string) => {
    if (!selectedFeatures.includes(feature)) {
      const newFeatures = [...selectedFeatures, feature];
      const newInputValue = `${inputValue} and ${feature}`;
      setInputValue(newInputValue);
      setSelectedFeatures(newFeatures);
      setFeatures([]); // Hide features after selection
    }
  };

  const handleNoFeatureClick = () => {
    setFeatures([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', maxWidth: '1000px', mt: 2, gap: 5 }}>
    <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, textAlign: 'center', boxShadow: 3, width: '60%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Create a Smart Contract
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        multiline
        rows={4}
        value={inputValue}
        label="Describe the smart contract you want to create"
        onChange={handleInputChange}
        inputProps={{
          maxLength: maxCharacters,
          style: { whiteSpace: 'pre-line' }
        }}
        sx={{ mb: 2 }}
      />
      <Typography variant="caption" component="p" color="textSecondary">
        {maxCharacters - inputValue.length} characters remaining
      </Typography>
        {!featuresReceived && ( // Conditionally render the button
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendDescription}
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Description'}
          </Button>
        )}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {features.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'no-wrap', gap: 2, mt: 1 }}>
            {features.map((feature: any, index: any) => (
              <Button
                key={index}
                variant="text"
                sx={{
                  fontSize: '10px',
                  textTransform: 'lowercase',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  },
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
                onClick={() => handleFeatureSelect(feature)}
              >
                <Typography variant="body2">
                  {feature}
                </Typography>
              </Button>
            ))}
          </Box>
        )}
        {featuresReceived && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={generatedCode}
              onClick={() => {
                setFeatures([]);
                handleGenerateSmartContract();
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generate Smart Contract'}
            </Button>
          </Box>
        )}
      </Box>
      {generatedCode && (
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, textAlign: 'center', boxShadow: 3, width: '60%' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Generated Smart Contract
          </Typography>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              height: '160px',
              overflowY: 'auto',
              padding: 2,
              border: '1px solid #ddd',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2">{generatedCode}</Typography>
          </Box>
          <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2
      }}
    >
      <Box sx={{ flex: 1 }}></Box>
      <Button
        variant="outlined"
        onClick={() => {
          setGeneratedCode('');
          setInputValue('');
          setSelectedFeatures([]); // Clear selected features
          setFeaturesReceived(false); // Reset features received flag
        }}
        sx={{ mx: 'auto' }}
      >
        Start New
      </Button>
      <IconButton
        sx={{ 
          flex: 1,
          justifyContent: 'flex-end',
          color: '',
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
        onClick={() => handleCopy(generatedCode)}
      >
        <ContentCopyIcon />
      </IconButton>
    </Box>
        </Box>
      )}
    </Box>
  );
};

export default SmartContractGenerator;
