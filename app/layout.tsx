import type { Metadata } from "next";
import { Inter, Crushed } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../lib/theme';
import "./globals.css";
import { GoogleOAuthProvider, clientId } from '../lib/googleAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from '../lib/UserContext';
import { SmartContractProvider } from '../lib/SmartContractContext';
import { DeployContractProvider } from "@/lib/DeployContractContext";
import DialogflowLoader from '../lib/DialogflowLoader';
import { DialogflowProvider } from '../lib/DialogflowContext';

const inter = Inter({ subsets: ["latin"] });
const crushed = Crushed({ weight: '400', subsets: ["latin"] });

export const metadata: Metadata = {
  title: "((a)elf genie)",
  description: "AI powered solution for devs building on aelf Layer1 Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={'flex flex-col min-h-screen'}>
        <GoogleOAuthProvider clientId={clientId}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastContainer />
            <UserProvider>
            <DialogflowProvider>
                  <DialogflowLoader>
                  <SmartContractProvider>
                    <DeployContractProvider><div className="flex-1">{children}</div></DeployContractProvider>
                    </SmartContractProvider>
                  </DialogflowLoader>
                </DialogflowProvider>
            </UserProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
