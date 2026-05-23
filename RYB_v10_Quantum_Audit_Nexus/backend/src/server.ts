import { createApp } from './app';
import { initializeAgents } from './agents/swarm/orchestrator';
import { initializeDatabase } from './models';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database connected');

    // Initialize AI agents
    await initializeAgents();
    console.log('✅ Agent Swarm initialized');

    // Start server
    const { server } = createApp();
    server.listen(PORT, () => {
      console.log(`🚀 RYB v10.0 Quantum Nexus running on port ${PORT}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
    });
  } catch (error) {
    console.error('Failed to bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();