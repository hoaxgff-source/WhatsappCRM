import { app } from './app.js';
import { env } from './config/env.js';
import { query } from './db/client.js';
import { startSchedulers } from './jobs/scheduler.js';

async function start() {
  await query('select 1');
  startSchedulers();
  app.listen(Number(env.API_PORT), () => {
    console.log(`API running on ${env.API_PORT}`);
  });
}

start();
