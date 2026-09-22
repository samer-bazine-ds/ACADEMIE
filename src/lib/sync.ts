import {supabase} from './supabase';
import {useAcademy, type Attendance, type Group, type Module, type ParentAccount, type Payment, type SchoolLevel, type Session, type Student, type Teacher} from './store';
let schoolId:string|null=null,hydrating=false,timer:number|undefined;const pending=new Set<string>();
let last={levels:[] as string[],modules:[] as string[],teachers:[] as string[],groups:[] as string[],students:[] as string[],sessions:[] as string[],payments:[] as string[],attendance:[] as string[]};
const snapshot=()=>{const s=useAcademy.getState();return{levels:s.levels.map(x=>x.id),modules:s.modules.map(x=>x.id),teachers:s.teachers.map(x=>x.id),groups:s.groups.map(x=>x.id),students:s.students.map(x=>x.id),sessions:s.sessions.map(x=>x.id),payments:s.payments.map(x=>x.id),attendance:s.attendance.map(x=>`${x.sessionId}:${x.studentId}`)}};
const fromCycle=(v:string)=>v==='primary'?'Primaire':v==='middle'?'Moyen':'Secondaire';
const toCycle=(v:string)=>v==='Primaire'?'primary':v==='Moyen'?'middle':'secondary';
const fail=(e:unknown)=>{const value=e as {message?:string;details?:string;hint?:string;code?:string};const message=e instanceof Error?e.message:value?.message||value?.details||value?.hint||value?.code||'Erreur de synchronisation inconnue';useAcademy.setState({syncError:message,loading:false})};
export async function hydrateAcademy(){hydrating=true;useAcademy.setState({loading:true,syncError:null});try{
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Session expirée.');
 const {data:p,error:pe}=await supabase.from('profiles').select('role,school_id,parent_id').eq('id',user.id).single();if(pe)throw pe;schoolId=p.school_id;
 const rs=await Promise.all(['schools','levels','modules','teachers','groups','students','enrollments','sessions','attendance','payments','parents'].map(t=>supabase.from(t).select('*')));for(const r of rs)if(r.error)throw r.error;
 const [schools,lr,mr,tr,gr,sr,er,ser,ar,pyr,pr]=rs.map(r=>r.data||[]),en=er as any[],parents=pr as any[];
 const levels:SchoolLevel[]=(lr as any[]).map(x=>({id:x.id,name:x.name,cycle:fromCycle(x.cycle)}));
 const modules:Module[]=(mr as any[]).map(x=>({id:x.id,levelId:x.level_id,name:x.name}));
 const teachers:Teacher[]=(tr as any[]).map(x=>({id:x.id,moduleId:x.module_id||'',name:x.full_name,phone:x.phone||'',email:x.email||''}));
 const groups:Group[]=(gr as any[]).map(x=>({id:x.id,teacherId:x.teacher_id||'',name:x.name,schedule:Array.isArray(x.schedule)?String(x.schedule[0]||''):String(x.schedule||''),price:Number(x.price_per_session)}));
 const students:Student[]=(sr as any[]).map(x=>{const e=en.find(y=>y.student_id===x.id&&y.active),g=groups.find(y=>y.id===e?.group_id),pa=parents.find(y=>y.id===x.parent_id);return{id:x.id,groupId:e?.group_id||'',teacherId:g?.teacherId||'',levelId:x.level_id||'',name:`${x.first_name||''} ${x.last_name||''}`.trim(),parent:pa?.full_name||'',phone:pa?.phone||'',birthDate:x.birth_date||'',status:x.status||'actif'}});
 const sessions:Session[]=(ser as any[]).map(x=>({id:x.id,groupId:x.group_id,date:x.date,topic:x.topic||'',automatic:x.automatic,movedFrom:x.moved_from||undefined}));
 const attendance:Attendance[]=(ar as any[]).map(x=>({sessionId:x.session_id,studentId:x.student_id,status:x.status==='present'?'present':'absent'}));
 const payments:Payment[]=(pyr as any[]).map(x=>({id:x.id,studentId:x.student_id,groupId:x.group_id,amount:Number(x.amount),date:String(x.paid_at).slice(0,10),note:x.note||'',receiptNo:x.receipt_no||''}));
 const parentAccounts:ParentAccount[]=parents.flatMap(pa=>students.filter(s=>(sr as any[]).find(x=>x.id===s.id)?.parent_id===pa.id).map(s=>({id:pa.id,studentId:s.id,parentName:pa.full_name,username:pa.username||'',password:s.birthDate})));
 last={levels:levels.map(x=>x.id),modules:modules.map(x=>x.id),teachers:teachers.map(x=>x.id),groups:groups.map(x=>x.id),students:students.map(x=>x.id),sessions:sessions.map(x=>x.id),payments:payments.map(x=>x.id),attendance:attendance.map(x=>`${x.sessionId}:${x.studentId}`)};
 useAcademy.setState({levels,modules,teachers,groups,students,sessions,attendance,payments,parentAccounts,currentParentId:p.role==='parent'?p.parent_id:null,schoolName:(schools as any[])[0]?.name||'Mon école',activeSchoolEmail:user.email||null,loading:false,syncError:null});
}catch(e){fail(e)}finally{setTimeout(()=>hydrating=false,0)}}
async function ok(q:PromiseLike<{error:any}>){const {error}=await q;if(error)throw error}
async function sync(){if(!schoolId||hydrating)return;const s=useAcademy.getState();try{
 const now=snapshot(),tables=['payments','sessions','students','groups','teachers','modules','levels'] as const;
 for(const table of tables){const removed=last[table].filter(id=>!now[table].includes(id));if(removed.length)await ok(supabase.from(table).delete().in('id',removed));}
 const removedAttendance=last.attendance.filter(k=>!now.attendance.includes(k));for(const key of removedAttendance){const [sessionId,studentId]=key.split(':');await ok(supabase.from('attendance').delete().eq('session_id',sessionId).eq('student_id',studentId));}
 await ok(supabase.from('levels').upsert(s.levels.map((x,i)=>({id:x.id,school_id:schoolId,name:x.name,cycle:toCycle(x.cycle),order:i+1}))));
 await ok(supabase.from('modules').upsert(s.modules.map(x=>({id:x.id,level_id:x.levelId,name:x.name}))));
 await ok(supabase.from('teachers').upsert(s.teachers.map(x=>({id:x.id,school_id:schoolId,module_id:x.moduleId,full_name:x.name,phone:x.phone||null,email:x.email||null}))));
 await ok(supabase.from('groups').upsert(s.groups.map(x=>({id:x.id,module_id:s.teachers.find(t=>t.id===x.teacherId)?.moduleId,teacher_id:x.teacherId,name:x.name,price_per_session:x.price,schedule:[x.schedule]}))));
 for(const a of s.parentAccounts){if(pending.has(a.id))continue;const st=s.students.find(x=>x.id===a.studentId);if(!st)continue;const {data}=await supabase.from('parents').select('id').eq('id',a.id).maybeSingle();if(!data){pending.add(a.id);const {data:created,error}=await supabase.functions.invoke('create-parent',{body:{username:a.username,password:a.password,parent_name:a.parentName,phone:st.phone,student_id:st.id,parent_id:a.id,student_name:st.name,birth_date:st.birthDate,level_id:st.levelId,group_id:st.groupId}});if(error)throw error;if(created?.username&&created.username!==a.username)useAcademy.setState(x=>({parentAccounts:x.parentAccounts.map(p=>p.id===a.id?{...p,username:created.username}:p)}));}}
 const parent=(id:string)=>s.parentAccounts.find(a=>a.studentId===id)?.id||null;
 await ok(supabase.from('students').upsert(s.students.map(x=>({id:x.id,school_id:schoolId,first_name:x.name,last_name:'',birth_date:x.birthDate||null,level_id:x.levelId,parent_id:parent(x.id),status:x.status}))));
 if(s.students.length)await ok(supabase.from('enrollments').update({active:false}).in('student_id',s.students.map(x=>x.id)));
 await ok(supabase.from('enrollments').upsert(s.students.filter(x=>x.groupId).map(x=>({student_id:x.id,group_id:x.groupId,active:true})),{onConflict:'student_id,group_id'}));
 await ok(supabase.from('sessions').upsert(s.sessions.map(x=>({id:x.id,group_id:x.groupId,date:x.date,topic:x.topic,automatic:!!x.automatic,moved_from:x.movedFrom||null}))));
 await ok(supabase.from('attendance').upsert(s.attendance.map(x=>({session_id:x.sessionId,student_id:x.studentId,status:x.status})),{onConflict:'session_id,student_id'}));
 await ok(supabase.from('payments').upsert(s.payments.map(x=>({id:x.id,student_id:x.studentId,group_id:x.groupId,month:`${x.date.slice(0,7)}-01`,amount:x.amount,paid_at:`${x.date}T12:00:00Z`,note:x.note||null,receipt_no:x.receiptNo}))));last=now;if(useAcademy.getState().syncError){hydrating=true;useAcademy.setState({syncError:null});hydrating=false;}
}catch(e){pending.clear();fail(e)}}
export function startAcademySync(){useAcademy.subscribe(()=>{if(hydrating)return;clearTimeout(timer);timer=window.setTimeout(()=>void sync(),500)});supabase.auth.onAuthStateChange(e=>{if(e==='SIGNED_IN')void hydrateAcademy();if(e==='SIGNED_OUT'){schoolId=null;useAcademy.setState({levels:[],modules:[],teachers:[],groups:[],students:[],sessions:[],attendance:[],payments:[],parentAccounts:[],currentParentId:null})}});void supabase.auth.getSession().then(({data})=>{if(data.session)void hydrateAcademy()})}
