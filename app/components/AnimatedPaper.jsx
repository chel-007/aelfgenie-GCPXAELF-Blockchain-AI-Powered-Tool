// AnimatedPaper.jsx
import React from 'react';
import { Box } from '@mui/material';
import "../globals.css";

const AnimatedPaper = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 150,
        left: 150,
        width: '200px',
        transform: 'rotate(-35deg)',
        zIndex: 1000,
        '@media (max-width: 600px)': {
          width: '150px',
        },
      }}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 10 H190 V190 H10 Z"
          fill="white"
          stroke="black"
          strokeWidth="3"
          className="paper" // Ensure this class name is applied
        />
        <text
          x="20"
          y="50"
          fontSize="14"
          fontFamily="Arial, sans-serif"
          fill="black"
        >
          elf genie has been designed to help all developers on aelf build
        </text>
        <text
          x="20"
          y="70"
          fontSize="14"
          fontFamily="Arial, sans-serif"
          fill="black"
        >
          dapps faster. Do this, do that, etc. Summarizes the app in a cute way,
        </text>
        <text
          x="20"
          y="90"
          fontSize="14"
          fontFamily="Arial, sans-serif"
          fill="black"
        >
          also includes the milestones feature after login.
        </text>
      </svg>
    </Box>
  );
};

export default AnimatedPaper;
