import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.csavh31.app',
  appName: 'CSAVH31',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'csavh31.fr'
  },
  ios: {
    contentInset: 'always'
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;