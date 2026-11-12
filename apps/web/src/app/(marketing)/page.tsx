import { Landing } from '@/features/landing/Landing';
import {landingExample} from '@/features/landing/story-example';
import type {Metadata} from 'next';

export const metadata:Metadata={title:'Unravel | Every bug has a story.',description:'Explicit bug recording, private session replay and developer-reviewed Playwright regression tests. Follow the sequence behind browser bugs.'};
export default function Home() { return <Landing example={landingExample()}/>; }
