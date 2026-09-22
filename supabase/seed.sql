-- Run after creating an Auth school user, then replace the UUID below.
do $$ declare owner_id uuid := '00000000-0000-0000-0000-000000000001'; school uuid; begin
 insert into schools(name,address,phone,email,owner_user_id) values('Académie El Djazaïr','12 rue Didouche Mourad, Alger','021 55 42 18','contact@eldjazair.dz',owner_id) returning id into school;
 insert into profiles(id,role,school_id) values(owner_id,'school',school);
 insert into teachers(school_id,full_name,phone,email) values(school,'Nadia Benali','0555123456','n.benali@eldjazair.dz'),(school,'Karim Bouzid','0661457890','k.bouzid@eldjazair.dz'),(school,'Sarah Meziane','0770221133','s.meziane@eldjazair.dz');
 insert into parents(school_id,full_name,phone,email) values(school,'Leïla Bensaïd','0771894210','leila@example.com'),(school,'Samir Amrane','0556342018','samir@example.com');
 insert into students(school_id,first_name,last_name,birth_date,level_id,parent_id) select school,x.first,x.last,date '2012-01-01'+x.n,(select id from levels where school_id=school and name='4AM'),(select id from parents where school_id=school order by full_name limit 1 offset (x.n%2)) from (values('Lina','Bensaïd',1),('Yacine','Amrane',2),('Meriem','Haddad',3),('Adam','Saadi',4),('Inès','Rahmani',5),('Rayan','Khelifi',6),('Sara','Ouali',7),('Iyad','Mansouri',8),('Nour','Belkacem',9),('Amine','Cherif',10)) x(first,last,n);
end $$;

-- Academic programme, groups and one month of operational data.
insert into modules(level_id,name)
select l.id,m.name from levels l cross join (values('Mathématiques'),('Physique'),('Langue arabe'),('Anglais')) m(name)
where l.name in ('4AM','3AS') and not exists(select 1 from modules x where x.level_id=l.id and x.name=m.name);

insert into groups(module_id,teacher_id,name,price_per_session,schedule)
select m.id,t.id,'Groupe A',case when m.name='Mathématiques' then 1500 else 1250 end,
       '[{"day":1,"time":"14:30"},{"day":4,"time":"14:30"}]'::jsonb
from modules m join levels l on l.id=m.level_id join teachers t on t.school_id=l.school_id
where l.name='4AM' and m.name in ('Mathématiques','Physique','Langue arabe')
  and t.full_name=case m.name when 'Mathématiques' then 'Nadia Benali' when 'Physique' then 'Karim Bouzid' else 'Sarah Meziane' end;

insert into enrollments(student_id,group_id,start_date)
select s.id,g.id,date '2026-09-01' from students s join groups g on true
join modules m on m.id=g.module_id join levels l on l.id=m.level_id
where s.school_id=l.school_id and l.name='4AM' on conflict do nothing;

insert into sessions(group_id,date,topic)
select g.id,d.day,'Séance de septembre' from groups g cross join
(values(date '2026-09-03'),(date '2026-09-07'),(date '2026-09-10'),(date '2026-09-14'),(date '2026-09-17'),(date '2026-09-21'),(date '2026-09-24'),(date '2026-09-28')) d(day);

insert into attendance(session_id,student_id,status)
select se.id,e.student_id,case when extract(day from se.date)::int % 7=0 then 'absent'::attendance_status else 'present'::attendance_status end
from sessions se join enrollments e on e.group_id=se.group_id on conflict do nothing;

insert into payments(student_id,group_id,month,amount,method,note)
select e.student_id,e.group_id,date '2026-09-01',case when row_number() over(order by e.student_id)%4=0 then 6000 else g.price_per_session*8 end,'cash','Paiement démo'
from enrollments e join groups g on g.id=e.group_id;
