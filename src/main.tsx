import { render } from 'preact';
import { App } from '@/app/App';
import { bootstrap } from '@/state/bootstrap';
import '@/styles/tokens.css';
import '@/styles/reset.css';
import '@/styles/global.css';

bootstrap();

const root = document.getElementById('app');
if (!root) {
  throw new Error('Root element #app not found');
}

render(<App />, root);
