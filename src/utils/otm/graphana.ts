import {diag, DiagConsoleLogger, DiagLogLevel} from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const logToLoki = async message => {
  try {
    const response = await fetch('http://172.20.10.2:3100/loki/api/v1/push', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        streams: [
          {
            stream: {app: 'TodoList'},
            values: [[Date.now().toString() + '000000', message]],
          },
        ],
      }),
    });
    console.log({response});
  } catch (error) {
    console.log(error);
  }
};

logToLoki('App started');

export {logToLoki};
