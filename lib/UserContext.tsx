"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  taskCounts: { generate: number; optimize: number; deploy: number; explore: number };
  incrementTaskCount: (task: 'generate' | 'optimize' | 'deploy' | 'explore') => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [taskCounts, setTaskCounts] = useState({
    generate: 0,
    optimize: 0,
    deploy: 0,
    explore: 0,
  });

  const incrementTaskCount = (task: 'generate' | 'optimize' | 'deploy' | 'explore') => {
    setTaskCounts((prevCounts) => ({
      ...prevCounts,
      [task]: prevCounts[task] + 1,
    }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, taskCounts, incrementTaskCount }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
