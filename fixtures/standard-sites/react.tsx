import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Site,StandardReporter} from '../standard-next/app/Site';
function App(){const [path,setPath]=useState(location.pathname);useEffect(()=>{const listener=()=>setPath(location.pathname);addEventListener('popstate',listener);return()=>removeEventListener('popstate',listener);},[]);return <><StandardReporter/><Site key={path} account={path==='/account'} accountLink={<a href="/account" onClick={event=>{event.preventDefault();history.pushState({},'', '/account');setPath('/account');}}>Open account</a>}/></>;}
createRoot(document.getElementById('root')!).render(<App/>);
