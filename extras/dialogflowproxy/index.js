const express = require('express');
const cors = require('cors');
const { v3beta1: { SessionsClient } } = require('@google-cloud/dialogflow-cx');
const app = express();

// CORS setup
app.use(cors({ origin: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Dialogflow client
// const projectId = 'aelfgenie'; // Replace with your Dialogflow project ID
// const location = 'us-central1'; // Replace with your Dialogflow agent's location
// //const agentId = 'cdf839c7-82e4-4ce0-80cb-e67a587bf826'; // Replace with your Dialogflow agent ID
// const agentId = 'd1d3c758-9348-42b1-955f-96b9f83227b1'
// const sessionClient = new SessionsClient({
//   apiEndpoint: 'us-central1-dialogflow.googleapis.com',
//   keyFilename: 'aelfgenieSA.json' // Replace with the path to your service account file
// });

// const basicAgentConfig = {
//   projectId: 'aelfgenie',
//   location: 'us-central1',
//   agentId: 'cdf839c7-82e4-4ce0-80cb-e67a587bf826',
//   keyFilename: 'aelfgenieSA.json'
// };

// Config for Detailed Troubleshooting Agent
// const detailedAgentConfig = {
//   projectId: 'aelfgenie',
//   location: 'us-central1',
//   agentId: 'd1d3c758-9348-42b1-955f-96b9f83227b1',
//   keyFilename: 'aelfgenieSA.json'
// };

const createSessionClient = (config) => {
  return new SessionsClient({
    apiEndpoint: `${config.location}-dialogflow.googleapis.com`,
    keyFilename: config.keyFilename
  });
};

const basicSessionClient = createSessionClient(basicAgentConfig);
const detailedSessionClient = createSessionClient(detailedAgentConfig);

// Define the route for handling Dialogflow requests
// app.post('/dialogflowProxy', async (req, res) => {
//   try {
//     const sessionId = req.body.sessionId || 'quickstart-session-id';
//     const sessionPath = sessionClient.projectLocationAgentSessionPath(
//       projectId, location, agentId, sessionId
//     );

//     const request = {
//       session: sessionPath,
//       queryInput: {
//         text: {
//           text: req.body.text,
//         },
//         languageCode: 'en' // Ensure the language code is included here
//       },
//     };

app.post('/dialogflowProxy', async (req, res) => {

 try {
  const { text, sessionId, useDetailedAgent } = req.body;

  const config = useDetailedAgent ? detailedAgentConfig : basicAgentConfig;
  const sessionClient = useDetailedAgent ? detailedSessionClient : basicSessionClient;

  const sessionPath = sessionClient.projectLocationAgentSessionPath(
    config.projectId, config.location, config.agentId, sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
      },
      languageCode: 'en'
    },
  };

    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    console.log(response)
    console.log(result)

    if (result.responseMessages && result.responseMessages.length > 0) {
      // Combine all text responses from messages
      const fulfillmentText = result.responseMessages
        .map(message => message.text && message.text.text && message.text.text[0])
        .join('\n'); // Separate messages with newlines

      res.status(200).json({
        fulfillmentText,
      });
    } else {
      res.status(200).json({
        fulfillmentText: "No response from Dialogflow",
      });
    }
  } catch (error) {
    console.error(`Error processing Dialogflow request: ${error}`);
    res.status(500).send('Error processing Dialogflow request');
  }
});

// Export the Express app as a Cloud Function
module.exports = {
  dialogflowProxy: app
};
