import {MeterProvider} from '@opentelemetry/sdk-metrics';
import {PrometheusExporter} from '@opentelemetry/exporter-prometheus';
import {WebTracerProvider} from '@opentelemetry/sdk-trace-web';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
import {logToLoki} from './graphana';

// Initialize Prometheus Exporter for metrics
const prometheusExporter = new PrometheusExporter(
  {port: 9009, host: 'http://172.20.10.2'}, // Match this with your Prometheus setup
  () =>
    console.log('Prometheus scrape endpoint: http://172.20.10.2:9009/metrics'),
);

// Initialize Meter Provider
const meterProvider = new MeterProvider({
  exporter: prometheusExporter,
  interval: 1000, // Collection interval in ms
});

// Expose a Meter instance for recording metrics in the app
const meter = meterProvider.getMeter('react-native-app');

// Initialize OTLP Trace Exporter for Tempo
const otlpExporter = new OTLPTraceExporter({
  url: 'http://172.20.10.2:3200/api/traces', // Adjust this URL to match your Tempo instance's endpoint
  headers: {}, // Add any necessary headers here
});

// Initialize Web Tracer Provider with OTLP Exporter for Tempo
const tracerProvider = new WebTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
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

/**
 * Utility function to record a screen load duration
 * @param {string} screenName - Name of the screen
 * @param {number} duration - Duration in milliseconds
 */
export const trackScreenLoad = (screenName, duration) => {
  screenLoadDuration.record(duration, {screen: screenName});
  logToLoki('Screen load duration recorded');
};

// Function to start a span for tracking an operation (useful for Tempo traces)
export const startTrace = name => {
  const tracer = tracerProvider.getTracer('react-native-app');
  const span = tracer.startSpan(name);
  return span;
};

// Function to end a span
export const endTrace = span => {
  span.end();
  logToLoki(`Trace ended: ${span.name}`);
};

// Export the providers and metrics for use in the app
export const telemetry = {
  meterProvider,
  tracerProvider,
};

export {meter, tracerProvider};
