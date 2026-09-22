import { CalendarCheck, Check, LogOut, School, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Card } from "../components/ui";
import { useAcademy } from "../lib/store";
import { money } from "../lib/utils";
import { supabase } from "../lib/supabase";
export default function ParentPortal() {
  const nav = useNavigate(),
    s = useAcademy(),
    account = (s.parentAccounts || []).find((x) => x.id === s.currentParentId),
    student = s.students.find((x) => x.id === account?.studentId);
  if (!account || !student)
    return (
      <div className="grid min-h-screen place-items-center bg-cream p-6">
        <Card className="max-w-md p-8 text-center">
          <School className="mx-auto text-brand-600" size={36} />
          <h1 className="mt-4 font-display text-xl font-bold">
            Connexion parent requise
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Connectez-vous avec l'identifiant fourni lors de l'inscription.
          </p>
          <button
            onClick={() => nav("/")}
            className="mt-5 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Retour à la connexion
          </button>
        </Card>
      </div>
    );
  const group = s.groups.find((x) => x.id === student.groupId),
    teacher = s.teachers.find((x) => x.id === student.teacherId),
    mod = s.modules.find((x) => x.id === teacher?.moduleId),
    level = s.levels.find((x) => x.id === student.levelId),
    sessions = (s.sessions || [])
      .filter((x) => x.groupId === group?.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    present = sessions.filter(
      (se) =>
        (s.attendance || []).find(
          (a) => a.sessionId === se.id && a.studentId === student.id,
        )?.status === "present",
    ).length,
    payments = (s.payments || [])
      .filter((x) => x.studentId === student.id && x.groupId === group?.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    due = present * (group?.price || 0),
    paid = payments.reduce((n, p) => n + p.amount, 0),
    balance = paid - due,
    rate = sessions.length ? Math.round((present / sessions.length) * 100) : 0;
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-black/[.06] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3 font-display font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
              <School size={19} />
            </span>
            {s.schoolName}
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              s.logoutParent();
              nav("/");
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 py-7 sm:p-6">
        <div className="relative overflow-hidden rounded-[26px] bg-[#14372e] p-6 text-white sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="lg" />
            <div>
              <p className="text-xs text-white/50">
                Espace parent · {account.parentName}
              </p>
              <h1 className="font-display text-2xl font-bold">
                {student.name}
              </h1>
              <p className="text-sm text-white/55">
                {level?.name} · {mod?.name} · {group?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<CalendarCheck />}
            label="Taux de présence"
            value={`${rate}%`}
          />
          <Stat
            icon={<Check />}
            label="Séances présentes"
            value={`${present}/${sessions.length}`}
          />
          <Stat
            icon={<Wallet />}
            label="Solde"
            value={money(balance)}
            tone={
              balance < 0
                ? "text-red-500"
                : balance > 0
                  ? "text-blue-600"
                  : "text-emerald-600"
            }
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b p-5">
              <h2 className="font-display font-bold">
                Historique des présences
              </h2>
              <p className="text-xs text-stone-400">Consultation uniquement</p>
            </div>
            {sessions.length ? (
              sessions.map((se) => {
                const ok =
                  (s.attendance || []).find(
                    (a) => a.sessionId === se.id && a.studentId === student.id,
                  )?.status === "present";
                return (
                  <div
                    key={se.id}
                    className="flex items-center gap-3 border-b p-4 last:border-0"
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${ok ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"}`}
                    >
                      {ok ? <Check size={17} /> : "—"}
                    </span>
                    <div className="flex-1">
                      <b className="text-sm">{se.date}</b>
                      <p className="text-xs text-stone-400">{se.topic}</p>
                    </div>
                    <Badge tone={ok ? "green" : "gray"}>
                      {ok ? "Présent" : "Absent"}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <Empty text="Aucune séance enregistrée" />
            )}
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b p-5">
              <h2 className="font-display font-bold">Encaissements</h2>
              <p className="text-xs text-stone-400">
                Historique en lecture seule
              </p>
            </div>
            {payments.length ? (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-b p-4 last:border-0"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Wallet size={17} />
                  </span>
                  <div className="flex-1">
                    <b className="text-sm">{p.date}</b>
                    <p className="text-xs text-stone-400">
                      {p.receiptNo || "Reçu enregistré"}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                  </div>
                  <b className="text-sm text-emerald-600">{money(p.amount)}</b>
                </div>
              ))
            ) : (
              <Empty text="Aucun encaissement enregistré" />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
  tone = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <Card className="p-5">
      <span className="text-brand-600">{icon}</span>
      <p className="mt-4 text-xs text-stone-400">{label}</p>
      <b className={`font-display text-2xl ${tone}`}>{value}</b>
    </Card>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-stone-400">{text}</div>;
}
