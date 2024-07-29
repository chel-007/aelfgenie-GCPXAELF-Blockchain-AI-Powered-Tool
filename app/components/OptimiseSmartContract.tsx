import { useState } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';
import { useSmartContract } from '../../lib/SmartContractContext';
import { useDialogflow } from '../../lib/DialogflowContext';
import MonacoEditor from '@monaco-editor/react';
import { sendMessageToDialogflow } from '../../lib/dialogflowUtils';

const OptimiseSmartContract = () => {
  const {
    inputValue,
    setInputValue,
    generatedCode,
    setGeneratedCode,
  } = useSmartContract();

  const { setResponseMessage } = useDialogflow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizationReasons, setOptimizationReasons] = useState<string | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const axios = require("axios").default;

  const handleCodeChange = (value: any) => {
    setInputValue(value);
  };

  const handleOptimizeSmartContract = async () => {
    setIsLoading(true);
    setError(null);
    const combinedInput = `Can you optimise this Aelf Blockchain Smart Contract Code according to Aelf Standards Methods, improve Speed and security:\n${inputValue}`;
  
    try {
      const optimizedCode = await optimizeSmartContract(combinedInput);
      const { code, reasons } = parseOptimizedResponse(optimizedCode);
      setGeneratedCode(code);
      setOptimizationReasons(reasons);
      setIsOptimized(true);
      const dflResponse = await sendMessageToDialogflow('successOptionUI2');
      setResponseMessage(dflResponse);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError('Error optimizing smart contract');
      toast.error('Error optimizing smart contract');
    }
  };

  const parseOptimizedResponse = (response: string) => {
    const codeStartIndex = response.indexOf('```');
    const codeEndIndex = response.lastIndexOf('```');
    if (codeStartIndex !== -1 && codeEndIndex !== -1) {
      const code = response.substring(codeStartIndex + 3, codeEndIndex).trim();
      const reasons = response.substring(codeEndIndex + 3).trim();
      return { code, reasons };
    }
    return { code: response, reasons: '' }; // If no backticks found, return the original response
  };

  const handleCopy = (text: any) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      toast.error('Failed to copy');
    });
  };

  async function optimizeSmartContract(description: string) {
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/text/code_generation",
      headers: {
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDQzNjJjMTItZmUyMi00Y2RmLTgzYjUtY2FmOGY4NDFlZmEyIiwidHlwZSI6ImFwaV90b2tlbiJ9.8k0fDgF28RvmqweFMpdU_EQb9e_Xg7_loGdacacjcAE",
      },
      data: {
        providers: "openai",
        prompt: '',
        instruction: description,
        temperature: 0.14,
        max_tokens: 4096,
      },
    };
  
    try {
      const response = await axios.request(options);
      return response.data.openai.generated_text;
    } catch (error) {
     // console.error(error);
      throw error;
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', maxWidth: '1000px', mt: 2, gap: 5 }}>
      <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, textAlign: 'center', boxShadow: 3, width: '60%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
          {isOptimized ? 'Optimized Smart Contract' : 'Optimize Smart Contract'} {/* Dynamic title */}
        </Typography>
        <MonacoEditor
          width="100%"
          height="300px"
          language="csharp"
          theme="vs-dark" // Use the dark theme to make it look like a code editor
          value={generatedCode || inputValue}
          onChange={handleCodeChange}
          options={{
            selectOnLineNumbers: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
            automaticLayout: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {!generatedCode && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOptimizeSmartContract}
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Optimize Smart Contract'}
          </Button>
        )}
        {generatedCode && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2
            }}
          >
            <IconButton
              sx={{ color: 'inherit' }}
              onClick={() => handleCopy(generatedCode)}
            >
              <ContentCopyIcon />
            </IconButton>
            <Button
              variant="outlined"
              onClick={() => {
                setGeneratedCode('');
                setInputValue('');
                setOptimizationReasons(null);
                setIsOptimized(false); // Reset optimization status
                sendMessageToDialogflow('second option');
              }}
              sx={{ mx: 'auto' }}
            >
              Start New
            </Button>
          </Box>
        )}
      </Box>
      {optimizationReasons && (
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, textAlign: 'center', boxShadow: 3, width: '60%' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Optimization Reasons
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
            <Typography variant="body2">{optimizationReasons}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OptimiseSmartContract;
