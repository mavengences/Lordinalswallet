// InputProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export const InputContext = createContext<any>(null);

export const useInput = () => useContext(InputContext);

interface InputProviderProps {
  children: ReactNode;
}

const InputProvider: React.FC<InputProviderProps> = ({ children }) => {
  const [inputValue, setInputValue] = useState<any>('');

  const setInput = (value: any) => {
    setInputValue(value);
  };

  return <InputContext.Provider value={{ inputValue, setInput }}>{children}</InputContext.Provider>;
};

export default InputProvider;
