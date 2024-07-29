import React, { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Tooltip, IconButton, TableSortLabel, TablePagination, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { formatDistanceToNow } from 'date-fns';
import CustomDatePicker from './CustomDatePicker';


interface Transaction {
  transactionId: string;
  blockHeight: number;
  timestamp: { value: string };
  size: number;
  methodName?: string;
  count?: number;
  status?: string;
  error?: string;
  hour?: number;
  date?: { value: string };
  hourly_count?: number;
}

interface Props {
    selectedDate: Date | null;
    handleDateChange: (date: Date | null) => void;
  }

const shortenTransactionId = (transactionId: string) => {
    if (!transactionId) return 'N/A';
    if (transactionId.length <= 10) return transactionId;
    return `${transactionId.slice(0, 5)}...${transactionId.slice(-5)}`;
  };
  

  const tableHeaders: { [key: string]: string[] } = {
    largeTransactions: ['Transaction ID', 'Block Height', 'Timestamp', 'Size (bytes)'],
    dailyTransactionVolume: ['Date', 'Hour', 'Count'],
    smartContractMethodActivity: ['Method Name', 'Count'],
    transactionStatus: ['Status', 'Method Name', 'Count'],
  };
  

const ExploreChain: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysisType, setAnalysisType] = useState('largeTransactions');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const [viewType, setViewType] = useState<'table' | 'graph'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortingMode, setSortingMode] = useState<'size' | 'time'>('size');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const resetAnalysisStates = () => {
    setTransactions([]);
    setAnalyzed(false);
    setLoading(false);
    setPage(0);
    setSelectedDate(null);
  };
  
  const handleAnalysisChange = (event: SelectChangeEvent<string>) => {
    resetAnalysisStates();
    setAnalysisType(event.target.value);
  };
  

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleSortingModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newSortingMode: 'size' | 'time'
  ) => {
    if (newSortingMode !== null) {
      setSortingMode(newSortingMode);
    }
  };

  // async function fetchData() {
  //   try {
  //     const response = await fetch('/api/hello');
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // }

  async function analyzeTransactions() {
    setLoading(true);
    try {
      const response = await fetch(`/api/bigquery?analysisType=${analysisType}`);
      const results = await response.json();
      setTransactions(results);
      console.log(results);
      setAnalyzed(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  
  

  const sortedTransactions = useMemo(() => {
    return Array.isArray(transactions) ? [...transactions].sort((a, b) => {
      if (sortingMode === 'size') {
        return b.size - a.size;
      } else {
        return new Date(b.timestamp.value).getTime() - new Date(a.timestamp.value).getTime();
      }
    }) : [];
  }, [transactions, sortingMode]);

  const filteredTransactions = useMemo(() => {
    if (!selectedDate) return sortedTransactions;
    return sortedTransactions.filter(txn =>
      txn.date?.value && new Date(txn.date.value).toDateString() === selectedDate.toDateString()
    );
  }, [sortedTransactions, selectedDate]);

  
  const displayTransactions: Transaction[] = useMemo(() => {
    if (analysisType === 'largeTransactions') {
      return sortedTransactions;
    }
    return filteredTransactions;
  }, [analysisType, sortedTransactions, filteredTransactions]) as Transaction[];
  

  const formatHour = (hour: number): string => {
    if (hour === 0) {
      return '12 AM';
    } else if (hour < 12) {
      return `${hour} AM`;
    } else if (hour === 12) {
      return '12 PM';
    } else {
      return `${hour - 12} PM`;
    }
  };
  

  const data = useMemo(() => {
    let labels: string[] = [];
    let datasetData: number[] = [];
    let datasetLabel: string = '';
  
    if (analysisType === 'largeTransactions') {
      labels = sortedTransactions.map((txn: Transaction) => shortenTransactionId(txn.transactionId));
      datasetData = sortedTransactions.map((txn: Transaction) => txn.size);
      datasetLabel = 'Transaction Size';
    } else if (analysisType === 'dailyTransactionVolume') {
        const hourlyCounts: Record<string, number> = {};
        filteredTransactions.forEach(txn => {
          const hour = txn.hour ?? 'N/A';
          if (!hourlyCounts[hour]) {
            hourlyCounts[hour] = 0;
          }
          hourlyCounts[hour] += txn.hourly_count ?? 0;
        });
        labels = Object.keys(hourlyCounts).sort((a, b) => parseInt(a) - parseInt(b)).map(hour => formatHour(parseInt(hour)));
        datasetData = Object.values(hourlyCounts);
        datasetLabel = 'Transaction Volume';
    } else if (analysisType === 'smartContractMethodActivity') {
      labels = filteredTransactions.map((txn: Transaction) => txn.methodName ?? 'N/A');
      datasetData = filteredTransactions.map((txn: Transaction) => txn.count ?? 0);
      datasetLabel = 'Method Activity';
    }
  
    return {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: datasetData,
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
        },
      ],
    };
  }, [filteredTransactions, analysisType]);
  
  

  return (
    <Box
      sx={{
        bgcolor: 'white',
        p: 4,
        borderRadius: 2,
        textAlign: 'center',
        boxShadow: 3,
        width: '80%',
        maxWidth: '800px',
        mt: 2,
        mx: 'auto',
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Explore AElf Blockchain
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="analysis-type-label">Analysis Type</InputLabel>
        <Select
            labelId="analysis-type-label"
            value={analysisType}
            onChange={handleAnalysisChange}
        >
            <MenuItem value="largeTransactions">Large Transactions</MenuItem>
            <MenuItem value="dailyTransactionVolume">Transaction Volume</MenuItem>
            <MenuItem value="smartContractMethodActivity">Smart Contract Activity</MenuItem>
        </Select>
        </FormControl>

      <Box>
        <Button variant="contained" onClick={analyzeTransactions} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Analyze'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setViewType(viewType === 'table' ? 'graph' : 'table')}
          sx={{ ml: 2 }}
        >
          Switch to {viewType === 'table' ? 'Graph' : 'Table'} View
        </Button>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', alignContent: 'right', fontSize: '0.2rem' }}>
        {analyzed && analysisType === 'largeTransactions' && (
          <ToggleButtonGroup
            value={sortingMode}
            exclusive
            onChange={handleSortingModeChange}
            aria-label="sorting mode"
            sx={{
              mt: 2,
              fontSize: '0.2rem',
            }}
          >
            <ToggleButton value="size" aria-label="sort by size">
              Sort by Size
            </ToggleButton>
            <ToggleButton value="time" aria-label="sort by time">
              Sort by Time
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {analyzed && analysisType === 'dailyTransactionVolume' && (
            <CustomDatePicker selectedDate={selectedDate} handleDateChange={handleDateChange} />
        )}
      </Box>
      <Box sx={{ mt: 4 }}>
        {loading && <CircularProgress />}
        {!loading && analyzed && viewType === 'table' && (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {tableHeaders[analysisType].map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
  {displayTransactions.length > 0 ? (
    displayTransactions.map((transaction, index) => (
      <TableRow key={index}>
        {analysisType === 'largeTransactions' && (
          <>
            <TableCell>
              <Tooltip title={transaction.transactionId}>
                <a href={`https://tdvv-explorer.aelf.io/tx/${transaction.transactionId}`} target="_blank" rel="noopener noreferrer">
                  <span>{shortenTransactionId(transaction.transactionId)}</span>
                </a>
              </Tooltip>
            </TableCell>
            <TableCell>{transaction.blockHeight}</TableCell>
            <TableCell>
              {transaction.timestamp && transaction.timestamp.value 
                ? formatDistanceToNow(new Date(transaction.timestamp.value), { addSuffix: true }) 
                : 'N/A'}
            </TableCell>
            <TableCell>{transaction.size}</TableCell>
          </>
        )}
        {analysisType === 'dailyTransactionVolume' && (
          <>
            <TableCell>{transaction.date?.value}</TableCell>
            <TableCell>{transaction.hour ?? 'N/A'}</TableCell>
            <TableCell>{transaction.hourly_count ?? 'N/A'}</TableCell>
          </>
        )}
        {analysisType === 'smartContractMethodActivity' && (
          <>
            <TableCell>{transaction.status ?? 'N/A'}</TableCell>
            <TableCell>{transaction.methodName ?? 'N/A'}</TableCell>
            <TableCell>{transaction.count}</TableCell>
          </>
        )}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5}>No transactions found.</TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={transactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
        {!loading && analyzed && viewType === 'graph' && (
          <Box sx={{ mt: 4 }}>
            <Line data={data} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExploreChain;
