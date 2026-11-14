/** Human-readable page text only; never input values. Works on inert replay DOM too. */
export function actionTargetLabel(element:Element):string {
 const control=element as Element & {labels?:NodeListOf<HTMLLabelElement>};
 const source=control.labels?.[0]??element.closest('label');
 const clean=(node:Element)=>{const copy=node.cloneNode(true) as Element;copy.querySelectorAll('input,textarea,select,script,style,[data-unravel-block]').forEach(n=>n.remove());return (copy.textContent??'').replace(/\s+/g,' ').trim();};
 const value=source?clean(source):element.getAttribute('aria-label')??(element.matches('button,a,summary')?clean(element):'');
 return value.includes('[redacted]')?'':value.slice(0,160);
}
