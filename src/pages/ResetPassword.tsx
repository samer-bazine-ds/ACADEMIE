import {FormEvent, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {KeyRound, School} from 'lucide-react';
import {Button, Card, Field} from '../components/ui';
import {supabase} from '../lib/supabase';

export default function ResetPassword(){
  const navigate=useNavigate();
  const [error,setError]=useState(''),[loading,setLoading]=useState(false),[done,setDone]=useState(false);
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setError('');
    const form=new FormData(e.currentTarget),password=String(form.get('password')),confirmation=String(form.get('confirmation'));
    if(password.length<8){setError('Le mot de passe doit contenir au moins 8 caractères.');return;}
    if(password!==confirmation){setError('Les deux mots de passe ne correspondent pas.');return;}
    setLoading(true);const {error:updateError}=await supabase.auth.updateUser({password});setLoading(false);
    if(updateError){setError('Le lien est invalide ou expiré. Demandez un nouveau lien.');return;}
    await supabase.auth.signOut();setDone(true);
  };
  return <div className="grid min-h-screen place-items-center bg-cream p-4"><Card className="w-full max-w-md p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">{done?<School/>:<KeyRound/>}</span>{done?<><h1 className="mt-5 font-display text-2xl font-bold">Mot de passe modifié</h1><p className="mt-2 text-sm text-stone-500">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p><Button className="mt-6 w-full" onClick={()=>navigate('/')}>Retour à la connexion</Button></>:<><h1 className="mt-5 font-display text-2xl font-bold">Nouveau mot de passe</h1><p className="mt-2 text-sm text-stone-500">Choisissez un nouveau mot de passe sécurisé pour votre école.</p><form onSubmit={submit} className="mt-6 grid gap-4"><Field name="password" type="password" label="Nouveau mot de passe" required autoComplete="new-password"/><Field name="confirmation" type="password" label="Confirmer le mot de passe" required autoComplete="new-password"/>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}<Button disabled={loading}>{loading?'Modification…':'Enregistrer le mot de passe'}</Button></form></>}</Card></div>
}
