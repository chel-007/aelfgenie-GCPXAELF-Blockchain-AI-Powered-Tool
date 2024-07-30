import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { toast } from 'react-toastify';

export const sendMessageToDialogflow = async (message: string, useDetailedAgent: boolean = false): Promise<string> => {
  const sessionId = uuidv4(); // Generate a unique session ID

  try {
    const response = await axios.post('https://us-central1-aelfgenie.cloudfunctions.net/dialogflowProxy/dialogflowProxy', {
      text: message,
      sessionId: sessionId, // Use the generated session ID
      useDetailedAgent: useDetailedAgent // Add the useDetailedAgent flag
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    //console.log('Response from Dialogflow:', response.data.fulfillmentText);
    return response.data.fulfillmentText;
    
  } catch (error) {
    console.error('Error sending message to Dialogflow:', error);
    toast.error('Error sending message, please check your connection and try again');
    return 'Error';
  }
};
