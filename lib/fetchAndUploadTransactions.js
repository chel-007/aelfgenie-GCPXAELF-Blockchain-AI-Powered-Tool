import fetch from 'node-fetch';
import AElf from 'aelf-sdk';
import { BigQuery } from '@google-cloud/bigquery';

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'aelfgenie-bigquery.json';
const bigquery = new BigQuery();
const datasetId = 'aelfchain_dataset';
const tableId = 'transactions';
const aelf = new AElf(new AElf.providers.HttpProvider('https://tdvv-public-node.aelf.io'));

// Function to create dataset if it doesn't exist
const createDataset = async () => {
  try {
    await bigquery.dataset(datasetId).get({ autoCreate: true });
    console.log(`Dataset ${datasetId} exists or was created.`);
  } catch (error) {
    console.error(`Error creating dataset ${datasetId}:`, error);
  }
};

// Function to create table if it doesn't exist
const createTable = async () => {
  const schema = [
    { name: 'transactionId', type: 'STRING' },
    { name: 'blockHeight', type: 'INTEGER' },
    { name: 'timestamp', type: 'TIMESTAMP' },
    { name: 'size', type: 'INTEGER' },
    { name: 'methodName', type: 'STRING' },
    { name: 'toAddress', type: 'STRING' },
    { name: 'isContract', type: 'BOOLEAN' },
    { name: 'status', type: 'STRING' },
  ];

  try {
    await bigquery.dataset(datasetId).table(tableId).get({ autoCreate: true, schema });
    console.log(`Table ${tableId} exists or was created.`);
  } catch (error) {
    console.error(`Error creating table ${tableId}:`, error);
  }
};

const getBlockDetailsByHash = async (blockHash) => {
  try {
    const block = await aelf.chain.getBlock(blockHash, false);
    return block.Header.Time; // Return the block timestamp
  } catch (error) {
    console.error(`Error fetching block details for blockHash ${blockHash}:`, error);
    return null;
  }
};

const isContractAddress = async (address) => {
  try {
    const contractDescriptor = await aelf.chain.getContractFileDescriptorSet(address);
    return contractDescriptor ? true : false;
  } catch (error) {
    return false;
  }
};

const fetchTransactionsFromBlock = async (blockHeight) => {
  try {
    const block = await aelf.chain.getBlockByHeight(blockHeight, true);
    const transactions = block.Body.Transactions;
    const transactionDetails = await Promise.all(
      transactions.map(txId => aelf.chain.getTxResult(txId))
    );

    const transactionData = await Promise.all(transactionDetails.map(async (tx) => {
      const isContract = await isContractAddress(tx.Transaction.To);
      const blockTimestamp = await getBlockDetailsByHash(tx.BlockHash);

      return {
        transactionId: tx.TransactionId,
        blockHeight: blockHeight,
        timestamp: blockTimestamp,
        size: tx.TransactionSize,
        methodName: tx.Transaction.MethodName,
        toAddress: tx.Transaction.To,
        status: tx.Status,
        error: tx.Error,
        isContract: isContract,
      };
    }));

    return transactionData;
  } catch (error) {
    console.error(`Error fetching transactions for block ${blockHeight}:`, error);
    return [];
  }
};

const fetchAndUploadTransactions = async () => {
  try {
    await createDataset();
    await createTable();

    const latestHeight = await aelf.chain.getBlockHeight();
    let transactions = [];
    const blocksPerDay = 24 * 60 * 60 / 10;
    const blockRange = Math.floor(blocksPerDay * 0.001);

    for (let height = latestHeight - blockRange; height <= latestHeight; height++) {
      const txs = await fetchTransactionsFromBlock(height);
      transactions = [...transactions, ...txs];
    }

    console.log(transactions);

    await bigquery.dataset(datasetId).table(tableId).insert(transactions);
    console.log('Transactions uploaded to BigQuery successfully.');
  } catch (error) {
    console.error('Error fetching or uploading transactions:', error);
  }
};

fetchAndUploadTransactions().catch(error => {
  console.error('Unhandled error in fetchAndUploadTransactions:', error);
});
