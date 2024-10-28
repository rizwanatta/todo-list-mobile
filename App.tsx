// App.js
import React from 'react';
import 'react-native-url-polyfill/auto';
import {StatusBar} from 'react-native';
import {Home} from './src/pages/Home';
import {telemetry} from './src/utils/otm/TelemetryProvider';

export default function App() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Home />
    </>
  );
}
