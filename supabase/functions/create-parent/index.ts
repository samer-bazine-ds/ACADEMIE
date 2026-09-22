import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.1';
const headers={'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'authorization, x-client-info, apikey, content-type'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers});
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {data:{user}}=await admin.auth.getUser(auth.replace('Bearer ',''));if(!user)return json({error:'Unauthorized'},401);
  const {data:profile}=await admin.from('profiles').select('role,school_id').eq('id',user.id).single();if(profile?.role!=='school')return json({error:'Forbidden'},403);
  const {username,password,parent_name,phone,student_id,parent_id,student_name,birth_date,level_id,group_id}=await req.json();
  if(!username||!password||!student_id||!parent_id||!group_id||!level_id)return json({error:'Données incomplètes'},400);
  const {data:group}=await admin.from('groups').select('id,modules!inner(level_id,levels!inner(school_id))').eq('id',group_id).single();
  const moduleRow=Array.isArray(group?.modules)?group.modules[0]:group?.modules;
  const levelRow=Array.isArray(moduleRow?.levels)?moduleRow.levels[0]:moduleRow?.levels;
  if(!group||levelRow?.school_id!==profile.school_id||moduleRow?.level_id!==level_id)return json({error:'Groupe invalide'},403);
  const requested=String(username).toUpperCase(),prefix=requested.replace(/\d+$/,''),start=Number(requested.match(/\d+$/)?.[0]||1);let finalUsername=requested;
  for(let n=start;n<start+10000;n++){const candidate=`${prefix}${String(n).padStart(3,'0')}`;const {data:exists}=await admin.from('parents').select('id').ilike('username',candidate).maybeSingle();if(!exists){finalUsername=candidate;break}}
  const loginEmail=`${finalUsername.toLowerCase().replace(/[^a-z0-9.]/g,'')}@parents.academie.invalid`;
  const {data:created,error:createError}=await admin.auth.admin.createUser({email:loginEmail,password,email_confirm:true,user_metadata:{role:'parent',username:finalUsername}});
  if(createError)return json({error:createError.message},400);
  const rollback=async()=>{await admin.from('profiles').delete().eq('id',created.user.id);await admin.from('parents').delete().eq('id',parent_id);await admin.auth.admin.deleteUser(created.user.id)};
  const {error:parentError}=await admin.from('parents').insert({id:parent_id,school_id:profile.school_id,full_name:parent_name,phone,email:loginEmail,username:finalUsername,user_id:created.user.id});
  if(parentError){await rollback();return json({error:parentError.message},400)}
  const {error:profileError}=await admin.from('profiles').insert({id:created.user.id,role:'parent',school_id:profile.school_id,parent_id});
  if(profileError){await rollback();return json({error:profileError.message},400)}
  const parts=String(student_name).trim().split(/\s+/),last=parts.length>1?parts.pop()!:'';
  const {error:studentError}=await admin.from('students').insert({id:student_id,school_id:profile.school_id,first_name:parts.join(' ')||student_name,last_name:last,birth_date,level_id,parent_id,status:'actif'});
  if(studentError){await rollback();return json({error:studentError.message},400)}
  const {error:enrollmentError}=await admin.from('enrollments').insert({student_id,group_id,active:true});
  if(enrollmentError){await rollback();return json({error:enrollmentError.message},400)}
  return json({parent_id,student_id,username:finalUsername});
});
