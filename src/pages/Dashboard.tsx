import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  Plus,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { useAcademy } from "../lib/store";
import { money } from "../lib/utils";
export default function Dashboard() {
  const nav = useNavigate(),
    s = useAcademy(),
    today = new Date().toISOString().slice(0, 10),
    month = today.slice(0, 7);
  const monthSessions = (s.sessions || []).filter((x) =>
      x.date.startsWith(month),
    ),
    monthPayments = (s.payments || []).filter((x) => x.date.startsWith(month)),
    todaySessions = (s.sessions || [])
      .filter((x) => x.date === today)
      .sort((a, b) => {
        const ga =
            s.groups.find((g) => g.id === a.groupId)?.schedule.split(" ")[1] ||
            "",
          gb =
            s.groups.find((g) => g.id === b.groupId)?.schedule.split(" ")[1] ||
            "";
        return ga.localeCompare(gb);
      });
  const collected = monthPayments.reduce((n, p) => n + p.amount, 0);
  const kpis = [
    {
      title: "Élèves inscrits",
      value: s.students.length,
      Icon: UsersRound,
      to: "/app/students",
    },
    {
      title: "Enseignants",
      value: s.teachers.length,
      Icon: GraduationCap,
      to: "/app/teachers",
    },
    {
      title: "Modules",
      value: s.modules.length,
      Icon: BookOpen,
      to: "/app/levels",
    },
    {
      title: "Séances ce mois",
      value: monthSessions.length,
      Icon: CalendarDays,
      to: "/app/levels",
    },
    {
      title: "Encaissé ce mois",
      value: money(collected),
      Icon: Wallet,
      to: "/app/payments",
    },
  ];
  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#14372e] p-6 text-white shadow-[0_20px_50px_rgba(20,55,46,.18)] sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#55c5a0]/20 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-amber-300/10 blur-xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[.08] px-3 py-1 text-xs font-semibold text-brand-100">
              Tableau de bord · {new Intl.DateTimeFormat("fr-DZ", { day: "numeric", month: "long" }).format(new Date(`${today}T12:00:00`))}
            </span>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold leading-tight sm:text-3xl">
              Bonjour, bienvenue dans {s.schoolName}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
              Pilotez les cours, les présences et les encaissements depuis un espace clair et connecté.
            </p>
          </div>
          <div className="flex gap-6 rounded-2xl border border-white/10 bg-white/[.06] px-5 py-4 backdrop-blur-sm">
            <div><b className="font-display text-xl">{todaySessions.length}</b><p className="text-xs text-white/45">Séances aujourd'hui</p></div>
            <div className="w-px bg-white/10" />
            <div><b className="font-display text-xl">{money(collected)}</b><p className="text-xs text-white/45">Encaissé ce mois</p></div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(({ title, value, Icon, to }, index) => (
          <button key={title} onClick={() => nav(to)} className="text-left">
            <Card className="group relative h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(20,55,46,.12)]">
              <span className={`absolute inset-x-0 top-0 h-1 ${['bg-brand-500','bg-blue-500','bg-violet-500','bg-amber-500','bg-emerald-500'][index]}`} />
              <div className="flex justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${['bg-brand-50 text-brand-700','bg-blue-50 text-blue-700','bg-violet-50 text-violet-700','bg-amber-50 text-amber-700','bg-emerald-50 text-emerald-700'][index]}`}>
                  <Icon size={19} />
                </span>
                <ArrowRight
                  size={17}
                  className="text-stone-300 group-hover:text-brand-600"
                />
              </div>
              <p className="mt-5 text-xs font-medium text-stone-400">{title}</p>
              <p className="mt-1 font-display text-[1.65rem] font-extrabold tracking-tight">{value}</p>
            </Card>
          </button>
        ))}
      </div>
      {s.modules.length === 0 ? (
        <Card className="mt-5 grid min-h-80 place-items-center border-dashed p-8 text-center">
          <div>
            <GraduationCap className="mx-auto text-brand-600" size={32} />
            <h3 className="mt-4 font-display text-xl font-bold">
              Construisez votre école
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Commencez par ajouter un module à un niveau.
            </p>
            <Button className="mt-5" onClick={() => nav("/app/levels")}>
              <Plus size={17} />
              Commencer avec les niveaux
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-5 overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Aujourd’hui
              </p>
              <h3 className="mt-1 font-display text-xl font-bold">
                Programme du jour
              </h3>
              <p className="text-sm text-stone-400">
                {new Intl.DateTimeFormat("fr-DZ", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(`${today}T12:00:00`))}
              </p>
            </div>
            <span className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              {todaySessions.length} séance
              {todaySessions.length !== 1 ? "s" : ""}
            </span>
          </div>
          {todaySessions.length ? (
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {todaySessions.map((session) => {
                const group = s.groups.find((g) => g.id === session.groupId),
                  teacher = s.teachers.find((t) => t.id === group?.teacherId),
                  mod = s.modules.find((m) => m.id === teacher?.moduleId),
                  level = s.levels.find((l) => l.id === mod?.levelId),
                  time = group?.schedule.split(" ")[1] || "—",
                  count = s.students.filter(
                    (st) => st.groupId === group?.id && st.status === "actif",
                  ).length;
                return (
                  <button
                    key={session.id}
                    onClick={() => nav(`/app/group/${session.groupId}`)}
                    className="group flex items-center gap-4 rounded-2xl border border-black/[.07] p-4 text-left transition hover:border-brand-500/30 hover:bg-brand-50/30"
                  >
                    <div className="grid h-14 w-16 shrink-0 place-items-center rounded-xl bg-[#19362e] text-white">
                      <span className="text-center">
                        <Clock className="mx-auto mb-1" size={15} />
                        <b className="text-sm">{time}</b>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-display font-bold">
                        {group?.name}
                      </h4>
                      <p className="truncate text-sm text-stone-500">
                        {mod?.name} · {level?.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {teacher?.name} · {count} élèves
                      </p>
                    </div>
                    <ArrowRight
                      className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-brand-600"
                      size={18}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-60 place-items-center p-8 text-center">
              <div>
                <CalendarDays className="mx-auto text-stone-300" size={38} />
                <h4 className="mt-4 font-display font-bold">
                  Aucune séance aujourd’hui
                </h4>
                <p className="mt-2 text-sm text-stone-400">
                  Le programme du jour est libre.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
