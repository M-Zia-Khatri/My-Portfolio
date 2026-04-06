import app from './app.js';
import { getConfig } from './config/env.js';

const config = getConfig();

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
