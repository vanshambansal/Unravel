import { getImageProps } from 'next/image';
import { Landing } from '@/features/landing/Landing';
import {landingExample} from '@/features/landing/story-example';
import type {Metadata} from 'next';

export const metadata:Metadata={title:'Unravel | Every bug has a story.',description:'Explicit bug recording, private session replay and developer-reviewed Playwright regression tests. Follow the sequence behind browser bugs.'};
export default function Home() {
  const poster = (frame: 'start' | 'hero', mobile: boolean) => getImageProps({
    src: `/landing/artwork/scene-${frame}-${mobile ? 'mobile' : 'desktop'}.png`,
    alt: '', width: mobile ? 390 : 1440, height: mobile ? 844 : 900, quality: 90,
  }).props.src;
  const posters = { startDesktop: poster('start', false), heroDesktop: poster('hero', false), startMobile: poster('start', true), heroMobile: poster('hero', true) };
  return <Landing example={landingExample()} posters={posters}/>;
}
