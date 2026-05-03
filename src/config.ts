import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    type: 'number',
    description: 'Port on which proxy server will run',
    default: 3000,
  })
  .option('origin', {
    alias: 'o',
    type: 'string',
    description: 'URL of the server where requests will be forwarded',
    default: 'https://dummyjson.com',
  })
  .option('clear-cache', {
    type: 'boolean',
    description: 'Clear the stored cache',
  })
  .help()
  .parseSync();
