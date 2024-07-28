"use client";
import { useEffect } from 'react';
import { sendMessageToDialogflow } from './dialogflowUtils';
import { useDialogflow } from './DialogflowContext';
import { useUser } from './UserContext';

const DialogflowLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setResponseMessage } = useDialogflow();
  const { user } = useUser();

  useEffect(() => {
    let isMounted = true; // Flag to prevent setting state if component is unmounted

    const fetchResponse = async () => {
      const initialMessage = user ? 'hi' : 'not logged in';
      const response = await sendMessageToDialogflow(initialMessage);
      if (isMounted) {
        setResponseMessage(response);
      }
    };

    fetchResponse();

    return () => {
      isMounted = false; // Cleanup flag on unmount
    };
  }, [setResponseMessage, user]); // Add 'user' to the dependency array

  return <>{children}</>;
};

export default DialogflowLoader;
