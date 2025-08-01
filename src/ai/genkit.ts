'use server';

import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';

configureGenkit({
  plugins: [googleAI({apiVersion: 'v1'})],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export {genkit as ai};
