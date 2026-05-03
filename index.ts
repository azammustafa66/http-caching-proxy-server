import fs from 'fs/promises';
import fsSync from 'fs';

import app from './src/app';
import { argv } from './src/config';

if (argv['clear-cache']) {
  const doesDirExist = fsSync.existsSync('./cache');
  if (!doesDirExist) {
    console.error('Cache folder does not exist');
    process.exit(1);
  } else {
    await fs.rm('./cache', { recursive: true, force: true });
    console.log('Cache Cleared');
  }
} else if (argv.port && argv.origin) {
  console.log(`Starting proxy server on port ${argv.port}...`);
  console.log(`Forwarding requests to origin: ${argv.origin}`);
  app.listen(argv.port, () => console.log(`Up and running on ${argv.port}`));
} else {
  console.error('Error: You must provide both --port and --origin to start the server.');
  console.log('Run with --help for usage instructions.');
  process.exit(1);
}
