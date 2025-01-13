import os from 'os';
import config from '../config/config';
export default {
  getSystemHealth: () => {
    return {
      CPU_Usage: os.loadavg(),
      Total_Memory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
      Free_Memory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
    };
  },
  getApplicationHealth: () => {
    return {
      Enviroment: config.ENV,
      Uptime: `${process.uptime().toFixed(2)} Seconds`,
      Memory_Usage: {
        Heap_Total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`,
        Heap_Used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`
      }
    };
  }
};
