type Logger = {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string | Error) => void;
};

export const logger: Logger = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  warn: (msg) => console.log(`⚠ ${msg}`),
  error: (msg) => {
    const text = msg instanceof Error ? msg.message : msg;
    console.error(`✗ ${text}`);
  },
};
