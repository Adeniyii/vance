import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Toaster position="bottom-right" closeButton />
      <ClerkProvider {...pageProps} >
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  )
};

export default api.withTRPC(MyApp);
