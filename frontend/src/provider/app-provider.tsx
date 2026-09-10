import {
  createContext,
  useContext,
  useState,
  type SetStateAction,
  type Dispatch,
} from "react";

type AppProviderProps = {
  children: React.ReactNode;
};

type AppProviderState = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const initialState: AppProviderState = {
  isLoading: false,
  setIsLoading: () => null,
};

const AppProviderContext = createContext<AppProviderState>(initialState);

export function AppProvider({ children, ...props }: AppProviderProps) {
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  const value = {
    isLoading,
    setIsLoading,
  };

  return (
    <AppProviderContext.Provider {...props} value={value}>
      {children}
    </AppProviderContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppProviderContext);

  if (context === undefined)
    throw new Error("useApp must be used within an AppProvider");

  return context;
};
