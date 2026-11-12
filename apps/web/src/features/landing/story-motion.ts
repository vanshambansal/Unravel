import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/** One native-scroll transition. No wheel handlers, smoothing or second 3D scene. */
export function mountStoryMotion(root:HTMLElement){
 gsap.registerPlugin(ScrollTrigger);
 const section=root.querySelector<HTMLElement>('[data-diagnostic-journey]')!;
 const sticky=section.querySelector<HTMLElement>('[data-diagnostic-stage]')!;
 const panel=section.querySelector<HTMLElement>('[data-diagnostic-panel]')!;
 const anchor=section.querySelector<HTMLElement>('[data-status-anchor]')!;
 const reveal=section.querySelector<HTMLElement>('[data-diagnostic-reveal]')!;
 const media=gsap.matchMedia();
 media.add('(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)',()=>{
  section.dataset.zoom='on';
  let scale=1,x=0,y=0;
  function measure(){
   gsap.set(panel,{clearProps:'transform'});
   const a=anchor.getBoundingClientRect(),p=panel.getBoundingClientRect(),s=sticky.getBoundingClientRect();
   gsap.set(panel,{transformOrigin:`${a.left+a.width/2-p.left}px ${a.top+a.height/2-p.top}px`});
   scale=Math.max(sticky.clientWidth/a.width,sticky.clientHeight/a.height)*1.06;
   x=sticky.clientWidth/2-(a.left+a.width/2-s.left);
   y=sticky.clientHeight/2-(a.top+a.height/2-s.top);
  }
  function present(progress:number){
   const travel=gsap.utils.clamp(0,1,(progress-.16)/.6);
   const eased=travel*travel*(3-2*travel);
   gsap.set(panel,{scale:1+(scale-1)*eased,x:x*eased,y:y*eased,opacity:1-gsap.utils.clamp(0,1,(progress-.78)/.12)});
   gsap.set(reveal,{opacity:gsap.utils.clamp(0,1,(progress-.81)/.13),y:18*(1-gsap.utils.clamp(0,1,(progress-.81)/.13))});
   panel.inert=progress>.18;
   reveal.setAttribute('aria-hidden',String(progress<.85));
   section.dataset.progress=progress.toFixed(3);
  }
  measure();
  const trigger=ScrollTrigger.create({trigger:section,start:'top top',end:()=>`+=${section.offsetHeight-sticky.offsetHeight}`,invalidateOnRefresh:true,onRefreshInit:measure,onRefresh:self=>present(self.progress),onUpdate:self=>present(self.progress)});
  present(trigger.progress);
  return()=>{trigger.kill();delete section.dataset.zoom;delete section.dataset.progress;panel.inert=false;gsap.set([panel,reveal],{clearProps:'transform,opacity,transformOrigin'});reveal.setAttribute('aria-hidden','true');};
 });
 // The intro above us can change height after WebGL failure or a motion preference
 // change. Observing only the story misses that positional change.
 const resize=new ResizeObserver(()=>ScrollTrigger.refresh());resize.observe(root.closest('[data-landing-root]')??root);
 return()=>{resize.disconnect();media.revert();};
}
