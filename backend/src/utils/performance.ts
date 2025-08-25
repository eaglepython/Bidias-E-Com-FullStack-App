import { Request, Response, NextFunction } from 'express';
import { Server } from 'http';

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    const { method, url } = req;
    const { statusCode } = res;
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';

    const logMessage = `{"method":"${method}","url":"${url}","status":${statusCode},"duration":"${duration.toFixed(2)}ms","ip":"${ip}","userAgent":"${userAgent}","timestamp":"${new Date().toISOString()}"}`;
    
    console.log(logMessage);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${method} ${url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
};

// CPU usage monitoring
export const getCPUUsage = () => {
  const usage = process.cpuUsage();
  return {
    user: usage.user / 1000000, // Convert to seconds
    system: usage.system / 1000000, // Convert to seconds
  };
};

// Health check function
export const healthCheck = async () => {
  const memory = getMemoryUsage();
  const cpu = getCPUUsage();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory,
    cpu,
    version: process.version,
    pid: process.pid,
  };
};

// Graceful shutdown handler
export const gracefulShutdown = (server: Server) => {
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('Server closed successfully');
      
      // Close database connections
      // mongoose.connection.close(() => {
      //   console.log('Database connection closed');
      //   process.exit(0);
      // });
      
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after 30 seconds');
      process.exit(1);
    }, 30000);
  };
  
  // Handle different shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Nodemon restart
};

// Request timeout middleware
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process',
        });
      }
    }, timeout);
    
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};

// Request size limiter
export const requestSizeLimit = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const maxSize = parseSize(limit);
    let size = 0;
    
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        res.status(413).json({
          error: 'Request too large',
          message: `Request size exceeds ${limit}`,
        });
        return;
      }
    });
    
    next();
  };
};

// Helper function to parse size strings
function parseSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'b': return value;
    case 'kb': return value * 1024;
    case 'mb': return value * 1024 * 1024;
    case 'gb': return value * 1024 * 1024 * 1024;
    default: return 0;
  }
}
