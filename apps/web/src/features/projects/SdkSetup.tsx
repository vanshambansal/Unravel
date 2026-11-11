'use client';
import { useEffect, useRef, useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { FeedbackTransition } from '../workspace/ProductMotion';

export function SdkSetup({ projectId, websiteOrigin }: { projectId: string; websiteOrigin: string }) {
  const [framework,setFramework]=useState('Next.js'),[origin,setOrigin]=useState(''),[copied,setCopied]=useState('');
  const copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{setOrigin(location.origin);return()=>{if(copyTimer.current)clearTimeout(copyTimer.current);};},[]);
  const code=`${framework==='Next.js'?"'use client';\n\n":''}import { useEffect } from 'react';
import { mountWidget } from '@unravel/sdk';

export function UnravelReporter() {
  useEffect(() => {
    const widget = mountWidget({
      projectId: '${projectId}',
      applicationOrigin: ${JSON.stringify(origin||'YOUR_UNRAVEL_ORIGIN')},
    });
    return () => widget.destroy();
  }, []);
  return null;
}`;
  async function copy(value:string){try{await navigator.clipboard.writeText(value);setCopied('Copied');}catch{setCopied('Copy unavailable. Select the code to copy manually.');}if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(''),3500);}
  return <div className="setup-steps">
    <section className="setup-step"><h3>1. Install the local SDK</h3><p>The SDK is not published to npm yet. In this repository, use <code>@unravel/sdk</code> from the workspace after <code>corepack pnpm build:packages</code>. For another local React/Next.js project, run <code>corepack pnpm sdk:pack</code> and install the SDK tarball from <code>.cache/sdk-distribution</code>.</p><div className="setup-code"><header><span>External project · local package file</span></header><pre><code>{'pnpm add /path/to/unravel-sdk-0.1.0.tgz'}</code></pre></div></section>
    <section className="setup-step"><h3>2. Mount the reporting widget</h3><p>Add this component once near your application root. It supplies the launcher, recording controls, report form and submission workflow. It starts no recording until the visitor chooses Start.</p><LayoutGroup id="sdk-framework"><div className="setup-frameworks" role="tablist" aria-label="Integration framework">{['Next.js','React'].map(name=><button key={name} id={`framework-${name.replace('.','')}`} role="tab" aria-selected={framework===name} aria-controls="integration-code" tabIndex={framework===name?0:-1} onClick={()=>setFramework(name)} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setFramework(name==='React'?'Next.js':'React');(event.currentTarget.parentElement?.querySelector(`[aria-selected="false"]`) as HTMLElement)?.focus();}}}>{framework===name&&<motion.span className="framework-selection" layoutId="framework" />}<span>{name}</span></button>)}</div></LayoutGroup>
      <div className="setup-code" id="integration-code" role="tabpanel" aria-labelledby={`framework-${framework.replace('.','')}`}><header><span>UnravelReporter.tsx</span><button className="product-text-link" disabled={!origin} onClick={()=>void copy(code)}>Copy code</button></header><pre><code>{code}</code></pre></div><FeedbackTransition identity={copied}><p role="status" className="product-small">{copied||'Mount <UnravelReporter /> once in your root layout or app component.'}</p></FeedbackTransition>
    </section>
    <section className="setup-step"><h3>3. Send your first report</h3><p>Open <code>{websiteOrigin}</code>, click Report a bug, record a synthetic interaction, stop and submit. Return to Reports to investigate. The host, protocol and port must match exactly.</p><div className="product-notice"><p className="product-small">Text and input values are masked by default. Passwords are always blocked. Synthetic fixture opt-ins are deliberate test configuration; do not broadly allowlist a real page. Local HTTP ingestion is not ready for public deployment.</p></div></section>
  </div>;
}
