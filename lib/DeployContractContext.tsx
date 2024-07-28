"use client";
import React, { createContext, useReducer, ReactNode, Dispatch, useContext } from 'react';

// Define the steps
type Step = 'Start' | 'Configure' | 'Deploy' | 'Troubleshoot';

interface State {
  currentStep: Step;
}

interface Action {
  type: 'SET_STEP';
  payload: Step;
}

const initialState: State = {
  currentStep: 'Start',
};

// Create the context
const DeployContractContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

// Reducer function to handle state changes
const deployContractReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
};

// Context provider component
const DeployContractProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(deployContractReducer, initialState);

  return (
    <DeployContractContext.Provider value={{ state, dispatch }}>
      {children}
    </DeployContractContext.Provider>
  );
};

export { DeployContractProvider, DeployContractContext };
