import { ThemeProvider } from "./theme-provider";

type BaseProviderProps = {
  children: React.ReactNode;
};

export function BaseProvider({ children }: BaseProviderProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
