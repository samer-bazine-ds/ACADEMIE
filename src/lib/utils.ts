export const money=(n:number)=>new Intl.NumberFormat('fr-DZ').format(n)+' DA';
export const initials=(name:string)=>name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
