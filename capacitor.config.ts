import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.salesbeat.app',
  appName: 'distro-pal-magic',
  webDir: 'dist/client',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1051010289925-pnh0hgjsgao4tcbla1s0f44iq0kje4qk.apps.googleusercontent.com',
      androidClientId: '1051010289925-5d3pfsmh1fg3bf8g2b98uv4duigh0spd.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;