import { FormEvent, useState } from "react";
import { Pencil, Plus, Search, UsersRound } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Modal,
  Select,
} from "../components/ui";
import { useAcademy } from "../lib/store";
export default function Students() {
  const s = useAcademy();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),[selectedId,setSelectedId]=useState<string|null>(null);
  const selected=s.students.find(student=>student.id===selectedId);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      groupId = String(f.get("group")),
      group = s.groups.find((g) => g.id === groupId),
      teacher = s.teachers.find((t) => t.id === group?.teacherId),
      mod = s.modules.find((m) => m.id === teacher?.moduleId);
    if (!group || !teacher || !mod) return;
    const account=s.addStudent({
      groupId,
      teacherId: teacher.id,
      levelId: mod.levelId,
      name: String(f.get("name")),
      parent: String(f.get("parent")),
      phone: String(f.get("phone")),
      birthDate: String(f.get("birthDate")),
    });
    setOpen(false);
    window.alert(`Compte parent créé\nIdentifiant : ${account.username}\nMot de passe : ${account.password}`);
  };
  const edit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!selected)return;const f=new FormData(e.currentTarget),groupId=String(f.get('group')),group=s.groups.find(g=>g.id===groupId),teacher=s.teachers.find(t=>t.id===group?.teacherId),mod=s.modules.find(m=>m.id===teacher?.moduleId);if(!group||!teacher||!mod)return;s.updateStudent(selected.id,{name:String(f.get('name')),birthDate:String(f.get('birthDate')),parent:String(f.get('parent')),phone:String(f.get('phone')),status:String(f.get('status')) as 'actif'|'inactif',groupId,teacherId:teacher.id,levelId:mod.levelId});setSelectedId(null)};
  const visible = s.students.filter((x) =>
    `${x.name} ${x.parent}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Élèves</h2>
          <p className="text-sm text-stone-500">
            {s.students.length} élèves inscrits
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!s.groups.length}>
          <Plus size={17} />
          Inscrire un élève
        </Button>
      </div>
      {!s.groups.length && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Ajoutez d'abord un module, un enseignant et un groupe depuis la page
          Niveaux.
        </p>
      )}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-4 text-stone-400">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full outline-none"
            placeholder="Rechercher…"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-400">
              <tr>
                {[
                  "Élève",
                  "Niveau",
                  "Enseignant",
                  "Groupe",
                  "Parent",
                  "Identifiant parent",
                  "Statut",
                  "",
                ].map((x) => (
                  <th key={x} className="px-5 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((st) => (
                <tr key={st.id} onClick={()=>setSelectedId(st.id)} className="cursor-pointer border-t transition hover:bg-brand-50/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={st.name} />
                      <b>{st.name}</b>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {s.levels.find((x) => x.id === st.levelId)?.name}
                  </td>
                  <td className="px-5 py-3">
                    {s.teachers.find((x) => x.id === st.teacherId)?.name}
                  </td>
                  <td className="px-5 py-3">
                    {s.groups.find((x) => x.id === st.groupId)?.name}
                  </td>
                  <td className="px-5 py-3">{st.parent}</td>
                  <td className="px-5 py-3"><code className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-brand-700">{(s.parentAccounts||[]).find(account=>account.studentId===st.id)?.username||'—'}</code></td>
                  <td className="px-5 py-3">
                    <Badge tone={st.status==='actif'?'green':'gray'}>{st.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-brand-700"><span className="flex items-center gap-1 text-xs font-semibold"><Pencil size={14}/>Modifier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <div className="p-10 text-center text-stone-400">
            <UsersRound className="mx-auto mb-3" />
            Aucun élève
          </div>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Inscrire un élève"
      >
        <form onSubmit={submit} className="grid gap-4">
          <Field name="name" label="Nom complet" required />
          <Field name="birthDate" label="Date de naissance" type="date" required />
          <Select name="group" label="Groupe">
            {s.groups.map((g) => {
              const t = s.teachers.find((x) => x.id === g.teacherId),
                m = s.modules.find((x) => x.id === t?.moduleId);
              return (
                <option value={g.id} key={g.id}>
                  {g.name} — {t?.name} — {m?.name}
                </option>
              );
            })}
          </Select>
          <Field name="parent" label="Nom du parent" required />
          <Field name="phone" label="Téléphone" required />
          <p className="rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-700">Le compte parent sera créé automatiquement. L'identifiant suivra le format EL.NOM.001 et la date de naissance sera le mot de passe initial.</p>
          <Button type="submit">Inscrire dans le groupe</Button>
        </form>
      </Modal>
      <Modal open={!!selected} onClose={()=>setSelectedId(null)} title="Modifier l'élève">
        {selected&&<form onSubmit={edit} className="grid gap-4"><div className="rounded-xl border border-brand-500/20 bg-brand-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Identifiant parent généré</p><div className="mt-2 flex items-center justify-between gap-3"><code className="font-display text-lg font-bold text-brand-800">{(s.parentAccounts||[]).find(account=>account.studentId===selected.id)?.username||'Non généré'}</code><button type="button" onClick={()=>navigator.clipboard.writeText((s.parentAccounts||[]).find(account=>account.studentId===selected.id)?.username||'')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">Copier</button></div></div><Field name="name" label="Nom complet" defaultValue={selected.name} required/><Field name="birthDate" label="Date de naissance" type="date" defaultValue={selected.birthDate||''} required/><Select name="group" label="Groupe" defaultValue={selected.groupId}>{s.groups.map(g=>{const t=s.teachers.find(x=>x.id===g.teacherId),m=s.modules.find(x=>x.id===t?.moduleId);return <option value={g.id} key={g.id}>{g.name} — {t?.name} — {m?.name}</option>})}</Select><Field name="parent" label="Nom du parent" defaultValue={selected.parent} required/><Field name="phone" label="Téléphone" defaultValue={selected.phone} required/><Select name="status" label="Statut" defaultValue={selected.status}><option value="actif">Actif</option><option value="inactif">Inactif</option></Select><p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Modifier le nom ou la date de naissance met également à jour les identifiants du compte parent.</p><Button type="submit">Enregistrer les modifications</Button></form>}
      </Modal>
    </div>
  );
}
