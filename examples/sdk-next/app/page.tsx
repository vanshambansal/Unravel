import { DemoLab } from '../src/DemoLab';

import { QuestionDesk } from '../src/QuestionDesk';
import { UnravelReporter } from '../src/UnravelReporter';

export default function Page() {
  return (
    <main>
      <p data-unravel-safe-text>Next.js SDK manual test · localhost:4200</p>
      <QuestionDesk />
      <DemoLab />
      <UnravelReporter />
    </main>
  );
}
