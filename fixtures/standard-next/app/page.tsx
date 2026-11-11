import Link from 'next/link';
import {Site} from './ui';
export default function Page(){return <Site accountLink={<Link href="/account">Open account</Link>}/>;}
