'use client';
import { useEffect, useState } from 'react';

/** Keep Clerk session renewal outside the standalone React example's runtime. */
export function useDemoSession() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Demo authentication session';
    frame.setAttribute('data-unravel-block', '');
    const receive = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        event.source === frame.contentWindow &&
        event.data?.type === 'unravel-demo-session-ready'
      )
        setReady(true);
    };
    window.addEventListener('message', receive);
    frame.src = '/demo/session';
    document.body.append(frame);
    return () => {
      window.removeEventListener('message', receive);
      frame.remove();
    };
  }, []);
  return ready;
}
