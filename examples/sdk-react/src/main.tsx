import {DemoLab} from './DemoLab';
import {createRoot} from 'react-dom/client';



import {QuestionDesk} from './QuestionDesk';

import './style.css';

createRoot(document.getElementById('root')!).render(<main><p data-unravel-safe-text>React SDK manual test · localhost:4201</p><QuestionDesk/><DemoLab/></main>);

