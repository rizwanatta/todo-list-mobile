import {MeterProvider} from '@opentelemetry/sdk-metrics';
import {PrometheusExporter} from '@opentelemetry/exporter-prometheus';
import {WebTracerProvider} from '@opentelemetry/sdk-trace-web';
import {logToLoki} from './graphana';

// Initialize Prometheus Exporter
const prometheusExporter = new PrometheusExporter(
  {port: 9009, host: 'http://192.168.1.26'}, // Make sure this port matches the one in your Prometheus config
  () =>
    console.log('Prometheus scrape endpoint: http://192.168.1.26:9009/metrics'),
);

// Initialize Meter Provider
const meterProvider = new MeterProvider({
  exporter: prometheusExporter,
  interval: 1000, // Collection interval in ms
});

// Expose a Meter instance for recording metrics in the app
const meter = meterProvider.getMeter('react-native-app');

// Initialize Web Tracer Provider for tracing functionality
const tracerProvider = new WebTracerProvider();
tracerProvider.register();

// Create reusable metric instruments (e.g., counters and histograms)
export const apiRequestCounter = meter.createCounter('api_requests', {
  description: 'Counts the number of API requests made',
});

export const screenLoadDuration = meter.createHistogram(
  'screen_load_duration',
  {
    description: 'Duration of screen loading times',
  },
);

export {meter};

/**
 * Utility function to record a screen load duration
 * @param {string} screenName - Name of the screen
 * @param {number} duration - Duration in milliseconds
 */
export const trackScreenLoad = (screenName, duration) => {
  screenLoadDuration.record(duration, {screen: screenName});
  logToLoki('Screen load duration recorded');
};

// Export the providers and metrics for use in the app
export const telemetry = {
  meterProvider,
  tracerProvider,
};
