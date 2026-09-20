import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.salmaelmasry.timingorbit',
  appName: 'Timing Orbit',
  webDir: 'dist',
  ios: {
    // Do NOT set contentInset here.
    // viewport-fit=cover in index.html already makes the WKWebView
    // extend edge-to-edge AND exposes env(safe-area-inset-*) to CSS.
    // contentInset:'always' would shrink the WebView and leave a native
    // white iOS strip visible at the bottom of the screen.
    scrollEnabled: false,
  },
};

export default config;
