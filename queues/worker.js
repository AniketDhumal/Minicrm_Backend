// server/queues/worker.js
require('dotenv').config();
require('./campaign.queue'); // This starts processing the queue

console.log('Worker started and listening for jobs...');