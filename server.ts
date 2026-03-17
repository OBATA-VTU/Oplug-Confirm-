import express from 'express';
import path from 'path';

const app = express();

// Basic health check that doesn't depend on anything
app.get('/api/ping', (req, res) => {
  res.json({ status: 'pong', time: new Date().toISOString() });
});

async function setupVite() {
  try {
    // Import the main app logic
    const { app: apiApp } = await import('./api/index');
    app.use(apiApp);
    
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      console.log('Starting Vite in development mode...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Starting in production mode...');
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } catch (error) {
    console.error('Error setting up server:', error);
  }

  const PORT = 3000;
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

setupVite().catch(err => {
  console.error('Fatal error during server setup:', err);
  process.exit(1);
});
