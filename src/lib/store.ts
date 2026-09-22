import { create } from "zustand";
import { persist } from "zustand/middleware";
export type Cycle = "Primaire" | "Moyen" | "Secondaire";
export type SchoolLevel = { id: string; name: string; cycle: Cycle };
export type Module = { id: string; levelId: string; name: string };
export type Teacher = {
  id: string;
  moduleId: string;
  name: string;
  phone: string;
  email: string;
};
export type Group = {
  id: string;
  teacherId: string;
  name: string;
  schedule: string;
  price: number;
};
export type Student = {
  id: string;
  groupId: string;
  teacherId: string;
  levelId: string;
  name: string;
  parent: string;
  phone: string;
  birthDate: string;
  status: "actif" | "inactif";
};
export type ParentAccount = {id:string;studentId:string;parentName:string;username:string;password:string};
export type Session = {
  id: string;
  groupId: string;
  date: string;
  topic: string;
  automatic?: boolean;
  movedFrom?: string;
};
export type AttendanceStatus = "present" | "absent";
export type Attendance = {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
};
export type Payment = {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  date: string;
  note: string;
  receiptNo: string;
};
const levels: SchoolLevel[] = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}ap`,
    name: `${i + 1}${i ? "ème" : "ère"} AP`,
    cycle: "Primaire" as Cycle,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `${i + 1}am`,
    name: `${i + 1}${i ? "ème" : "ère"} AM`,
    cycle: "Moyen" as Cycle,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `${i + 1}as`,
    name: `${i + 1}${i ? "ème" : "ère"} AS`,
    cycle: "Secondaire" as Cycle,
  })),
];
type State = {
  levels: SchoolLevel[];
  modules: Module[];
  teachers: Teacher[];
  groups: Group[];
  students: Student[];
  sessions: Session[];
  attendance: Attendance[];
  payments: Payment[];
  parentAccounts: ParentAccount[];
  currentParentId: string | null;
  activeSchoolEmail: string | null;
  schoolName: string;
  addLevel: (n: string, c: Cycle) => void;
  addModule: (l: string, n: string) => void;
  addTeacher: (m: string, n: string, p: string, e: string) => void;
  addGroup: (t: string, n: string, s: string, p: number) => void;
  addStudent: (s: Omit<Student, "id" | "status">) => ParentAccount;
  loginParent: (username:string,password:string) => boolean;
  logoutParent: () => void;
  switchSchool: (email:string,name?:string) => void;
  addSession: (g: string, d: string, t: string) => void;
  updateSession: (id: string, date: string, topic: string) => void;
  ensureScheduledSessions: (g: string) => void;
  setAttendance: (a: string, b: string, c: AttendanceStatus) => void;
  addPayment: (a: string, b: string, c: number, d: string, e: string) => void;
  updateLevel: (id: string, v: Partial<SchoolLevel>) => void;
  updateModule: (id: string, v: Partial<Module>) => void;
  updateTeacher: (id: string, v: Partial<Teacher>) => void;
  updateGroup: (id: string, v: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  updateStudent: (id: string, v: Partial<Student>) => void;
  registerSchool: (n: string) => void;
};
const id = () => crypto.randomUUID(),
  update = <T extends { id: string }>(a: T[], key: string, v: Partial<T>) =>
    a.map((x) => (x.id === key ? { ...x, ...v } : x));
const dayIndex: Record<string, number> = {
  Dimanche: 0,
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
};
export const useAcademy = create<State>()(
  persist(
    (set) => ({
      levels,
      modules: [],
      teachers: [],
      groups: [],
      students: [],
      sessions: [],
      attendance: [],
      payments: [],
      parentAccounts: [],
      currentParentId: null,
      activeSchoolEmail: null,
      schoolName: "Mon école",
      addLevel: (name, cycle) =>
        set((s) => ({ levels: [...s.levels, { id: id(), name, cycle }] })),
      addModule: (levelId, name) =>
        set((s) => ({ modules: [...s.modules, { id: id(), levelId, name }] })),
      addTeacher: (moduleId, name, phone, email) =>
        set((s) => ({
          teachers: [...s.teachers, { id: id(), moduleId, name, phone, email }],
        })),
      addGroup: (teacherId, name, schedule, price) =>
        set((s) => ({
          groups: [...s.groups, { id: id(), teacherId, name, schedule, price }],
        })),
      addStudent: (student) => {
        const studentId=id(),lastName=student.name.trim().split(/\s+/).slice(-1)[0]||"ELEVE";
        const clean=lastName.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"").toUpperCase();
        let account!:ParentAccount;
        set((s)=>{const sequence=(s.parentAccounts||[]).length+1;account={id:id(),studentId,parentName:student.parent,username:`EL.${clean}.${String(sequence).padStart(3,"0")}`,password:student.birthDate};return{students:[...s.students,{...student,id:studentId,status:"actif"}],parentAccounts:[...(s.parentAccounts||[]),account]}});
        return account;
      },
      loginParent:(username,password)=>{let found=false;set(s=>{const enteredDate=password.trim().replace(/\D/g,''),account=(s.parentAccounts||[]).find(a=>a.username.toUpperCase()===username.trim().toUpperCase()&&a.password.replace(/\D/g,'')===enteredDate&&enteredDate.length===8);found=!!account;return account?{currentParentId:account.id}:{}});return found},
      logoutParent:()=>set({currentParentId:null}),
      switchSchool:(email,name)=>set(s=>{
        const normalized=email.trim().toLowerCase();
        if(!s.activeSchoolEmail){return {activeSchoolEmail:normalized,schoolName:name||s.schoolName}}
        const snapshot={levels:s.levels,modules:s.modules,teachers:s.teachers,groups:s.groups,students:s.students,sessions:s.sessions||[],attendance:s.attendance||[],payments:s.payments||[],parentAccounts:s.parentAccounts||[],schoolName:s.schoolName};
        localStorage.setItem(`academie-workspace:${s.activeSchoolEmail}`,JSON.stringify(snapshot));
        if(s.activeSchoolEmail===normalized)return name?{schoolName:name}:{};
        const stored=localStorage.getItem(`academie-workspace:${normalized}`);
        if(stored){try{return {...JSON.parse(stored),activeSchoolEmail:normalized,currentParentId:null}}catch{/* start clean */}}
        return {levels,modules:[],teachers:[],groups:[],students:[],sessions:[],attendance:[],payments:[],parentAccounts:[],currentParentId:null,activeSchoolEmail:normalized,schoolName:name||'Mon école'};
      }),
      addSession: (groupId, date, topic) =>
        set((s) => ({
          sessions: [
            ...(s.sessions || []),
            { id: id(), groupId, date, topic, automatic: false },
          ],
        })),
      updateSession: (sessionId, date, topic) =>
        set((s) => ({
          sessions: (s.sessions || []).map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  movedFrom: session.movedFrom || session.date,
                  date,
                  topic,
                }
              : session,
          ),
        })),
      ensureScheduledSessions: (groupId) =>
        set((s) => {
          const g = s.groups.find((x) => x.id === groupId),
            weekday = g ? dayIndex[g.schedule.split(" ")[0]] : undefined;
          if (!g || weekday === undefined) return {};
          const now = new Date(),
            year = now.getFullYear(),
            month = now.getMonth(),
            created: Session[] = [];
          for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
            const date = new Date(year, month, d);
            if (date.getDay() === weekday) {
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              if (
                !(s.sessions || []).some(
                  (x) =>
                    x.groupId === groupId &&
                    (x.date === iso || x.movedFrom === iso),
                )
              )
                created.push({
                  id: id(),
                  groupId,
                  date: iso,
                  topic: `Séance programmée · ${g.schedule}`,
                  automatic: true,
                });
            }
          }
          return { sessions: [...(s.sessions || []), ...created] };
        }),
      setAttendance: (sessionId, studentId, status) =>
        set((s) => ({
          attendance: [
            ...(s.attendance || []).filter(
              (a) => a.sessionId !== sessionId || a.studentId !== studentId,
            ),
            { sessionId, studentId, status },
          ],
        })),
      addPayment: (studentId, groupId, amount, date, note) =>
        set((s) => {
          const receiptNo = `REC-${date.replace(/-/g, "")}-${String((s.payments || []).length + 1).padStart(4, "0")}`;
          return {
            payments: [
              ...(s.payments || []),
              { id: id(), studentId, groupId, amount, date, note, receiptNo },
            ],
          };
        }),
      updateLevel: (id, v) => set((s) => ({ levels: update(s.levels, id, v) })),
      updateModule: (id, v) =>
        set((s) => ({ modules: update(s.modules, id, v) })),
      updateTeacher: (id, v) =>
        set((s) => ({ teachers: update(s.teachers, id, v) })),
      updateGroup: (id, v) =>
        set((s) => {
          const automaticSessionIds = (s.sessions || [])
            .filter(
              (session) =>
                session.groupId === id &&
                session.automatic === true &&
                !session.movedFrom,
            )
            .map((session) => session.id);
          return {
            groups: update(s.groups, id, v),
            sessions: (s.sessions || []).filter(
              (session) => !automaticSessionIds.includes(session.id),
            ),
            attendance: (s.attendance || []).filter(
              (entry) => !automaticSessionIds.includes(entry.sessionId),
            ),
          };
        }),
      deleteGroup: (groupId) =>
        set((s) => {
          const studentIds = s.students
            .filter((student) => student.groupId === groupId)
            .map((student) => student.id);
          const sessionIds = (s.sessions || [])
            .filter((session) => session.groupId === groupId)
            .map((session) => session.id);
          return {
            groups: s.groups.filter((group) => group.id !== groupId),
            students: s.students.filter(
              (student) => student.groupId !== groupId,
            ),
            sessions: (s.sessions || []).filter(
              (session) => session.groupId !== groupId,
            ),
            attendance: (s.attendance || []).filter(
              (entry) =>
                !studentIds.includes(entry.studentId) &&
                !sessionIds.includes(entry.sessionId),
            ),
            payments: (s.payments || []).filter(
              (payment) => payment.groupId !== groupId,
            ),
          };
        }),
      updateStudent: (studentId, v) =>
        set((s) => ({
          students: update(s.students, studentId, v),
          parentAccounts: (s.parentAccounts || []).map((account) => {
            if (account.studentId !== studentId) return account;
            const lastName = (v.name || s.students.find(x=>x.id===studentId)?.name || "ELEVE").trim().split(/\s+/).slice(-1)[0];
            const clean = lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const sequence = account.username.split(".").slice(-1)[0];
            return {...account,parentName:v.parent||account.parentName,username:`EL.${clean}.${sequence}`,password:v.birthDate||account.password};
          }),
        })),
      registerSchool: (schoolName) => set({ schoolName }),
    }),
    { name: "academie-groups-v3" },
  ),
);
