import { BigQuery } from '@google-cloud/bigquery';
import { NextApiRequest, NextApiResponse } from 'next';

console.log('Loading...');

const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!credentialsJson) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
}

const credentials = JSON.parse(credentialsJson);

const bigquery = new BigQuery({
  credentials,
  projectId: credentials.project_id,
});

const datasetId = 'aelfchain_dataset';
const tableId = 'transactions';

async function queryLargeTransactions() {
  const query = `
    SELECT transactionId, blockHeight, timestamp, size
    FROM \`${datasetId}.${tableId}\`
    ORDER BY size DESC
    LIMIT 10;
  `;

  const [rows] = await bigquery.query(query);
  return rows;
}

async function querySmartContractMethodActivity() {
  const query = `
    SELECT status, methodName, COUNT(*) as count
    FROM \`${datasetId}.${tableId}\`
    WHERE status IS NOT NULL
    GROUP BY status, methodName
    ORDER BY count DESC;
  `;

  const [rows] = await bigquery.query(query);
  return rows;
}

async function queryDailyTransactionVolume() {
  const query = `
    SELECT DATE(timestamp) as date, COUNT(*) as count, 
           EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as hourly_count
    FROM \`${datasetId}.${tableId}\`
    GROUP BY date, hour
    ORDER BY date DESC, hour DESC;
  `;

  const [rows] = await bigquery.query(query);
  return rows;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  
  console.log('Request received:', req.url, req.query);

  const { analysisType }: {
    analysisType: string;
} = req.body;


// const { analysisType } = req.query;

if (!analysisType) {
  res.status(400).json({ error: 'Missing analysisType parameter' });
  return;
}

  try {
    let results;
    switch (analysisType) {
      case 'largeTransactions':
        results = await queryLargeTransactions();
        break;
      case 'smartContractMethodActivity':
        results = await querySmartContractMethodActivity();
        break;
      case 'dailyTransactionVolume':
        results = await queryDailyTransactionVolume();
        break;
      default:
        res.status(400).json({ error: 'Invalid analysis type' });
        return;
    }
    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error during BigQuery execution:', error);
    res.status(500).json({ error: error.message });
  }
}
