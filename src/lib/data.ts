export type Status='present'|'absent'|'late'|'excused';
export const levels=[{id:'1ap',name:'1ère AP',cycle:'Primaire',students:18,modules:3},{id:'2ap',name:'2ème AP',cycle:'Primaire',students:21,modules:2},{id:'3ap',name:'3ème AP',cycle:'Primaire',students:16,modules:4},{id:'4ap',name:'4ème AP',cycle:'Primaire',students:24,modules:3},{id:'5ap',name:'5ème AP',cycle:'Primaire',students:19,modules:4},{id:'1am',name:'1ère AM',cycle:'Moyen',students:28,modules:5},{id:'2am',name:'2ème AM',cycle:'Moyen',students:26,modules:4},{id:'3am',name:'3ème AM',cycle:'Moyen',students:23,modules:5},{id:'4am',name:'4ème AM',cycle:'Moyen',students:30,modules:6},{id:'1as',name:'1ère AS',cycle:'Secondaire',students:25,modules:5},{id:'2as',name:'2ème AS',cycle:'Secondaire',students:22,modules:6},{id:'3as',name:'3ème AS',cycle:'Secondaire',students:27,modules:6}];
export const teachers: never[]=[];
export const students: {id:number;name:string;level:string;parent:string;phone:string;status:string}[]=[];
export const revenue=[{m:'Avr',v:0},{m:'Mai',v:0},{m:'Juin',v:0},{m:'Juil',v:0},{m:'Août',v:0},{m:'Sep',v:0}];
export const billing: {id:number;name:string;sessions:number;price:number;due:number;paid:number;credit:number}[]=[];
export const sessions: {date:string;topic:string;present:number;absent:number}[]=[];
