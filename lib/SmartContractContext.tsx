"use client";

import React, { createContext, useContext, useState } from 'react';

const SmartContractContext = createContext<any>(null);

export const useSmartContract = () => useContext(SmartContractContext);

export const SmartContractProvider = ({ children }: { children: React.ReactNode }) => {
  const [inputValue, setInputValue] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featuresReceived, setFeaturesReceived] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const value = {
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
  };

  return (
    <SmartContractContext.Provider value={value}>
      {children}
    </SmartContractContext.Provider>
  );
};
