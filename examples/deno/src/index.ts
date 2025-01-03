import { app } from './app.tsx';

function main() {
  const container = document.getElementById('root');

  if (!container) {
    console.error('Root element not found');
    return;
  }

  app.attach(container);
}

// Run the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);
