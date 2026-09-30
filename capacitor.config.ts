import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.storemate.app',
  appName: 'StoreMate',
  webDir: 'public',
  server: {
    url: 'https://storemate-rho.vercel.app',
    cleartext: false
  }
};

export default config;