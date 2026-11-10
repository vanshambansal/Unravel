import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SdkLab } from '../../apps/web/src/features/recording/SdkLab';
function Harness() {
  const [mounted, setMounted] = useState(true);
  return <><button data-unravel-block onClick={() => setMounted(value => !value)}>Toggle mount</button>{mounted && <SdkLab />}</>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Harness /></StrictMode>);
