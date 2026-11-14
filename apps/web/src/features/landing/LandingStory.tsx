 'use client';
import {useEffect,useRef} from 'react';
import type {LandingExample} from './story-example';
import {storyMarkup} from './story-markup';
import './story.css';
import './approved-story.css';
export function LandingStory({example}:{example:LandingExample}) {
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false;let dispose:(()=>void)|undefined;
 void import('./approved-story').then(({mountApprovedStory})=>{if(!cancelled&&root.current){dispose=mountApprovedStory(root.current,example);}});
 return()=>{cancelled=true;dispose?.();};},[example]);
 return <div className="approved-story" ref={root} dangerouslySetInnerHTML={{__html:storyMarkup}}/>;
}
