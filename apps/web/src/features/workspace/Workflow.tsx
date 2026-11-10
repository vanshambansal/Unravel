export function Workflow({ registered = false }: { registered?: boolean }) {
  return <ol className="product-workflow" aria-label="Register, integrate SDK, investigate">
    <li><span className="workflow-symbol" aria-hidden="true">{registered ? '✓' : '01'}</span><div><h3>Register</h3><p>Name your project and website.</p></div></li>
    <li><span className="workflow-symbol" aria-hidden="true">02</span><div><h3>Integrate SDK</h3><p>Add explicit recording to your site.</p></div></li>
    <li><span className="workflow-symbol" aria-hidden="true">03</span><div><h3>Investigate</h3><p>Follow the sequence behind a bug.</p></div></li>
  </ol>;
}
