import {ReactNode, useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {Spinner} from './ui';
import {supabase} from '../lib/supabase';

export default function RequireSchool({children}:{children:ReactNode}){
  const [allowed,setAllowed]=useState<boolean|null>(null);
  useEffect(()=>{
    let active=true;
    const check=async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active)setAllowed(false);return;}
      const {data}=await supabase.from('profiles').select('role').eq('id',user.id).single();
      if(active)setAllowed(data?.role==='school');
    };
    void check();
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>void check());
    return()=>{active=false;subscription.unsubscribe()};
  },[]);
  if(allowed===null)return <Spinner/>;
  return allowed?<>{children}</>:<Navigate to="/" replace/>;
}
