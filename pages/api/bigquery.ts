import { BigQuery } from '@google-cloud/bigquery';
import { NextApiRequest, NextApiResponse } from 'next';

console.log('Loading...');

// Replace this with your actual credentials JSON content
// const credentialsJson = {
//   "type": "service_account",
//   "project_id": "aelfgenie",
//   "private_key_id": "e11f3f4980b0b2d00b9e2a3974dee4d8b25755c9",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDkrhFpjRj+uXHZ\nl4rKtuYF4p9Rx3appwx371W2M8G9oDKH+4tqRNMyfkA6cR1Nwu00pQMK+Tt9RBZz\njvITmpeAa1NGsZ9TktYLFPGfZb+l2wCtxwSiye88UIMS0Vob8iOUlbJK3HOk7eP1\n6396NqGKcaQoMWoxGTE+y9EE38eDOqku7jhT9r5+GTCB3BYnLHPONW/IxJlyA4qH\nGPR2wwEmdkzQcptYNgYfKG9ZEv7LPrtvQRcNFLb5X1BZu+clNA/4jJbJCM0BM63t\nK/yP8IFQ0UKmyvETm6uinj2/oqaVWq9g85RsriQUOoTK3jtmunFWJNmY3ZIHECLj\ntLL/hdd5AgMBAAECggEAFt6ytpnqG0V8FZ0SgBoBEKscsF7QpwBiHpeEvKtZ76c3\nDoLxazAVaBoYvc+EtPtu4iIzlvQchzdZQHbWDnBaQPla03ndm4vWlLakQIL6QvHP\nVFHQTKCB6MgLh8UArEVP2iMLePGprh+tefFypwwSJUieuHdSrbTdiDB1h7WCnES/\n8+kQlRjVWCz+fiwXQ/cNx9SCNngTsZWadRuGvnMGcQmdkDg61ivGt6ceTZQULldW\nRmPBBOkpuiDyfpxbrlPHrpbnF96LNxLiQoiumwupac8b7ZoG+o2hy7C5apQov/hZ\n5uiVex0APUni0en1OYLtHJI7JrWPBXfbRGVLoNLYxQKBgQDyq5LXDMQWmHZzaZ8T\n2F44DD3erfFwsKXBn3AkI0oo/Gty6aT0gJdvWOCxqcvOVtHc1eo/4kWjszumcoP4\nWcyYlt51R8scoWhfu2MsQOdO8OnkZtkME6G7DB1pkXqTiSY8Ncpqm1bbk66wHJ6u\nLdA8q7Fi2lqHmVtU8hDJ1PZvlQKBgQDxPcN4tPw13XCPrrpZv4atnjyU7HNwju4Y\nUojDIAz1fquhz2BQjk1SdDl3fRelEUO0+6EOMcOTr/Y70u7ruyDFFYM3xHScop6e\nfhF1EZOVRa9PTTeA7bZL0PalH1IyMR8AffmzoN6yCXiZlT/oU+iC+n0BRxd5Wp8C\npMe8hIDfVQKBgE2A1KYQMrRQv0v/CMpqyTS3XC85eKoYEOh1BnjUOIQ8kgiibIeW\nZkcuqJy1cR0Wh3Izc9wxZTJyNPPlERcJfxmg3a2xX0JmnpIso/DnTbjdoqXK3zlH\nL9kwdlhYGUDzhZ2nRF2l/Sil0x32FgvlH+Owpje/KzixlwTbRtdfR9G9AoGACfuc\nUypqJXB8b/WzEHO0hwq9Rwxh2o6Pm8IOlsSExMPxJkkGm07INFlK537ts477Vknz\naDr29O2bKu6XpHmh6YXyYCRpDvJLzhM5dba8fLjdgFKZsWQk3w5OppadOCaAOez8\noEpP7N4nd3ONqXePb5weACeI+SSe3+UhvtNc4eECgYAO/nkIBbw4qbTbQ4omgmzw\nO0DJtS54Ce70LQ5qj7UQwis5y4Tddkigz1w9w2CBIzYSe2M0RyXPlnLhOav6HI2Q\n3kRdCk1wdEB2i1XNcI8IQVWzXhKnZK64LmK4igYlJMmynmwX7k/u41QTy8Edq9Wh\ndWZ0rXf0IbrvrVuWefVceA==\n-----END PRIVATE KEY-----\n",
//   "client_email": "bigquery@aelfgenie.iam.gserviceaccount.com",
//   "client_id": "110005257914939869519",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bigquery%40aelfgenie.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// };

const credentialsEnv = process.env.GOOGLE_CREDENTIALS;
if (!credentialsEnv) {
  throw new Error('GOOGLE_CREDENTIALS environment variable is not set.');
}

// Parse the JSON string into an object
let credentialsJson;
try {
  credentialsJson = JSON.parse(credentialsEnv);
} catch (error) {
  throw new Error('Failed to parse GOOGLE_CREDENTIALS environment variable.');
}

const bigquery = new BigQuery({
  credentials: credentialsJson,
  projectId: credentialsJson.project_id,
});

const datasetId = 'aelfchain_dataset';
const tableId = 'transactions';

async function queryLargeTransactions() {
  const query = `
    SELECT transactionId, blockHeight, timestamp, size
    FROM \`${datasetId}.${tableId}\`
    ORDER BY size DESC
    LIMIT 50;
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
  console.log('Request received:', req.url, req.query);

  const { analysisType } = req.query;

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
    console.log('Results:', results);
    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error during BigQuery execution:', error);
    res.status(500).json({ error: error.message });
  }
}
