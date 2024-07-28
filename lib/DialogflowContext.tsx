"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DialogflowContextProps {
  responseMessage: string | null;
  setResponseMessage: (message: string) => void;
}

const DialogflowContext = createContext<DialogflowContextProps | undefined>(undefined);

export const useDialogflow = () => {
  const context = useContext(DialogflowContext);
  if (!context) {
    throw new Error('useDialogflow must be used within a DialogflowProvider');
  }
  return context;
};

export const DialogflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  return (
    <DialogflowContext.Provider value={{ responseMessage, setResponseMessage }}>
      {children}
    </DialogflowContext.Provider>
  );
};
