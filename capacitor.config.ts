import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nammakadai.app',
  appName: 'Namma Kadai',
  webDir: 'public',
  server: {
    url: 'https://namma-kadai-rho.vercel.app',
    cleartext: false
  }
};

export default config;