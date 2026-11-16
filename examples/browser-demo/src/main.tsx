import { createRoot } from 'react-dom/client';
import { ScenarioSite } from '../../../apps/web/src/features/demo/ScenarioSite';
import '../../../apps/web/src/app/demo/demo.css';

// This entry is bundled independently; no Next imports, router or runtime are used.
createRoot(document.getElementById('root')!).render(<ScenarioSite framework="React" />);
