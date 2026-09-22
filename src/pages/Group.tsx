import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, CalendarPlus, Check, Pencil, Plus, Printer, Trash2, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAcademy } from "../lib/store";
import { Avatar, Badge, Button, Card, Field, Modal, Select } from "../components/ui";
import { money } from "../lib/utils";
export default function Group() {
  const { id } = useParams(),
    nav = useNavigate(),
    s = useAcademy();
  const group = s.groups.find((x) => x.id === id),
    teacher = s.teachers.find((x) => x.id === group?.teacherId),
    mod = s.modules.find((x) => x.id === teacher?.moduleId),
    level = s.levels.find((x) => x.id === mod?.levelId);
  const students = s.students.filter(
    (x) => x.groupId === id && x.status === "actif",
  );
  const sessions = (s.sessions || [])
    .filter((x) => x.groupId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const [tab, setTab] = useState<
      "students" | "attendance" | "monthly" | "payments"
    >("students"),
    [sessionId, setSession] = useState<string>(),
    [modal, setModal] = useState<
      "session" | "reschedule" | "payment" | "receipt" | "groupEdit" | null
    >(null),
    [payStudent, setPayStudent] = useState<string>();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const selected = sessionId || sessions[0]?.id;
  const monthlySessions = sessions
    .filter((session) => session.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date));
  const rows = useMemo(
    () =>
      students.map((st) => {
        const charged = sessions.filter(
          (se) =>
            (s.attendance || []).find(
              (x) => x.sessionId === se.id && x.studentId === st.id,
            )?.status === "present",
        ).length;
        const due = charged * (group?.price || 0),
          paid = (s.payments || [])
            .filter((p) => p.studentId === st.id && p.groupId === id)
            .reduce((n, p) => n + p.amount, 0);
        return { st, charged, due, paid, balance: paid - due };
      }),
    [students, sessions, s.attendance, s.payments, group?.price, id],
  );
  if (!group)
    return <Card className="p-10 text-center">Groupe introuvable.</Card>;
  const createSession = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    s.addSession(group.id, String(f.get("date")), String(f.get("topic")));
    setModal(null);
  };
  const rescheduleSession = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (selected)
      s.updateSession(
        selected,
        String(f.get("date")),
        String(f.get("topic")),
      );
    setModal(null);
  };
  const pay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (payStudent)
      s.addPayment(
        payStudent,
        group.id,
        Number(f.get("amount")),
        String(f.get("date")),
        String(f.get("note")),
      );
    setModal(null);
  };
  const editGroup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    s.updateGroup(group.id, {
      name: String(f.get("name")),
      schedule: `${f.get("day")} ${f.get("time")}`,
      price: Number(f.get("price")),
    });
    setModal(null);
    s.ensureScheduledSessions(group.id);
  };
  const removeGroup = () => {
    if (
      window.confirm(
        "Supprimer définitivement ce groupe, ses élèves, séances, présences et paiements ?",
      )
    ) {
      s.deleteGroup(group.id);
      nav("/app/levels");
    }
  };
  const toggle = (studentId: string, checked: boolean) =>
    selected &&
    s.setAttendance(selected, studentId, checked ? "present" : "absent");
  return (
    <div className="mx-auto max-w-7xl">
      <button
        onClick={() => nav("/app/levels")}
        className="mb-4 flex items-center gap-1 text-sm text-brand-700"
      >
        <ArrowLeft size={16} />
        Niveaux
      </button>
      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 bg-[#19362e] p-6 text-white sm:flex-row sm:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold">{group.name}</h2>
            <p className="mt-2 text-sm text-white/60">
              {level?.name} · {mod?.name} · {teacher?.name} · {group.schedule} · {money(group.price)} / séance
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="text-ink"
              onClick={() => setModal("groupEdit")}
            >
              <Pencil size={15} />
              Modifier
            </Button>
            <Button variant="danger" onClick={removeGroup}>
              <Trash2 size={15} />
              Supprimer
            </Button>
          </div>
        </div>
        <div className="scrollbar-none flex overflow-x-auto px-1">
          {[
            ["students", "Élèves"],
            ["attendance", "Présences"],
            ["payments", "Paiements"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setTab(key === "attendance" ? "monthly" : (key as typeof tab))
              }
              className={`min-w-28 flex-1 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold ${tab === key || (key === "attendance" && tab === "monthly") ? "border-brand-600 text-brand-700" : "border-transparent text-stone-400"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
      {tab === "students" && (
        <Card className="overflow-hidden">
          <div className="border-b p-5">
            <h3 className="font-display font-bold">
              {students.length} élèves dans ce groupe
            </h3>
          </div>
          {students.map((st) => (
            <div
              className="flex items-center gap-3 border-b p-4 last:border-0"
              key={st.id}
            >
              <Avatar name={st.name} />
              <div className="flex-1">
                <b className="text-sm">{st.name}</b>
                <p className="text-xs text-stone-400">Parent : {st.parent}</p>
              </div>
              <Badge>Actif</Badge>
            </div>
          ))}
          {!students.length && (
            <Empty text="Ajoutez des élèves depuis la hiérarchie des niveaux." />
          )}
        </Card>
      )}
      {tab === "monthly" && (
        <div>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-lg font-bold">
                Liste mensuelle des présences
              </h3>
              <p className="text-sm text-stone-500">
                Vue globale de tous les élèves et de toutes les séances.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setModal("session")}>
                <CalendarPlus size={16} />
                Nouvelle séance
              </Button>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <Card className="overflow-auto">
            {monthlySessions.length ? (
              <table className="w-full min-w-max text-center text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-400">
                  <tr>
                    <th className="sticky left-0 z-10 min-w-52 bg-stone-50 px-5 py-4 text-left">
                      Élève
                    </th>
                    {monthlySessions.map((session) => (
                      <th className="min-w-24 px-2 py-3" key={session.id}>
                        <button
                          title="Déplacer cette séance"
                          onClick={() => {
                            setSession(session.id);
                            setModal("reschedule");
                          }}
                          className="group mx-auto rounded-xl px-3 py-2 transition hover:bg-brand-50"
                        >
                          <span className="block text-stone-700 group-hover:text-brand-700">
                            {session.date.slice(8, 10)}/{session.date.slice(5, 7)}
                          </span>
                          <span className="mt-1 flex items-center justify-center gap-1 font-normal normal-case">
                            {new Intl.DateTimeFormat("fr-DZ", { weekday: "short" }).format(
                              new Date(`${session.date}T12:00:00`),
                            )}
                            <CalendarClock size={12} />
                          </span>
                        </button>
                      </th>
                    ))}
                    <th className="min-w-28 px-4 py-4">Total</th>
                    <th className="min-w-24 px-4 py-4">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const presentCount = monthlySessions.filter(
                      (session) =>
                        (s.attendance || []).find(
                          (entry) =>
                            entry.sessionId === session.id &&
                            entry.studentId === student.id,
                        )?.status === "present",
                    ).length;
                    const rate = Math.round(
                      (presentCount / monthlySessions.length) * 100,
                    );
                    return (
                      <tr className="border-t" key={student.id}>
                        <td className="sticky left-0 bg-white px-5 py-3 text-left">
                          <div className="flex items-center gap-3">
                            <Avatar name={student.name} size="sm" />
                            <b>{student.name}</b>
                          </div>
                        </td>
                        {monthlySessions.map((session) => {
                          const present =
                            (s.attendance || []).find(
                              (entry) =>
                                entry.sessionId === session.id &&
                                entry.studentId === student.id,
                            )?.status === "present";
                          return (
                            <td className="px-3 py-3" key={session.id}>
                              <button
                                title={present ? "Marquer absent" : "Marquer présent"}
                                onClick={() =>
                                  s.setAttendance(
                                    session.id,
                                    student.id,
                                    present ? "absent" : "present",
                                  )
                                }
                                className={`mx-auto grid h-8 w-8 place-items-center rounded-lg transition hover:scale-110 ${present ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-300 hover:bg-brand-50 hover:text-brand-600"}`}
                              >
                                {present ? <Check size={16} /> : "—"}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 font-bold">
                          {presentCount}/{monthlySessions.length}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={rate >= 75 ? "green" : "red"}>
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <Empty text="Aucune séance programmée pour ce mois." />
            )}
          </Card>
        </div>
      )}
      {tab === "payments" && (
        <Card className="overflow-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-400">
              <tr>
                {[
                  "Élève",
                  "Séances facturées",
                  "Prix / séance",
                  "Montant dû",
                  "Payé",
                  "Dernier encaissement",
                  "Solde",
                  "Statut",
                  "",
                ].map((x) => (
                  <th className="px-4 py-3" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr className="border-t" key={r.st.id}>
                  <td className="px-4 py-3 font-semibold">{r.st.name}</td>
                  <td className="px-4 py-3">{r.charged}</td>
                  <td className="px-4 py-3">{money(group.price)}</td>
                  <td className="px-4 py-3">{money(r.due)}</td>
                  <td className="px-4 py-3 text-emerald-600">
                    {money(r.paid)}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {(s.payments || [])
                      .filter(
                        (payment) =>
                          payment.studentId === r.st.id &&
                          payment.groupId === group.id,
                      )
                      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ||
                      "—"}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${r.balance < 0 ? "text-red-500" : r.balance > 0 ? "text-blue-600" : "text-emerald-600"}`}
                  >
                    {money(r.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        r.balance < 0 ? "red" : r.balance > 0 ? "blue" : "green"
                      }
                    >
                      {r.balance < 0
                        ? "Créance"
                        : r.balance > 0
                          ? "Crédit"
                          : "Payé"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setPayStudent(r.st.id);
                          setModal("payment");
                        }}
                      >
                        <Wallet size={15} />
                        Encaisser
                      </Button>
                      {r.paid > 0 && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setPayStudent(r.st.id);
                            setModal("receipt");
                          }}
                        >
                          Justificatif
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty text="Aucun élève à facturer." />}
        </Card>
      )}
      <Modal
        open={modal === "groupEdit"}
        onClose={() => setModal(null)}
        title="Modifier le groupe"
      >
        <form onSubmit={editGroup} className="grid gap-4">
          <Field name="name" label="Nom du groupe" defaultValue={group.name} required />
          <Select
            name="day"
            label="Jour hebdomadaire"
            defaultValue={group.schedule.split(" ")[0]}
          >
            {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(
              (day) => <option key={day}>{day}</option>,
            )}
          </Select>
          <Field
            name="time"
            label="Heure"
            type="time"
            defaultValue={group.schedule.split(" ")[1] || "14:00"}
            required
          />
          <Field
            name="price"
            label="Prix par séance (DA)"
            type="number"
            min="0"
            defaultValue={group.price}
            required
          />
          <Button type="submit">Enregistrer les modifications</Button>
        </form>
      </Modal>
      <Modal
        open={modal === "session"}
        onClose={() => setModal(null)}
        title="Nouvelle séance"
      >
        <form onSubmit={createSession} className="grid gap-4">
          <Field
            name="date"
            label="Date d'encaissement"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
          <Field name="topic" label="Sujet" required />
          <Button type="submit">
            <Plus size={16} />
            Créer la séance
          </Button>
        </form>
      </Modal>
      <Modal
        open={modal === "receipt"}
        onClose={() => setModal(null)}
        title="Justificatifs d'encaissement"
      >
        <div className="space-y-3">
          {(s.payments || [])
            .filter(
              (payment) =>
                payment.studentId === payStudent &&
                payment.groupId === group.id,
            )
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-400">
                      Reçu {payment.receiptNo || `REC-${payment.id.slice(0, 8)}`}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold">
                      {students.find((student) => student.id === payStudent)?.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {group.name} · {mod?.name}
                    </p>
                  </div>
                  <Badge tone="green">Encaissé</Badge>
                </div>
                <div className="mt-4 grid gap-3 rounded-xl bg-stone-50 p-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-stone-400">Date</p>
                    <b className="text-sm">{payment.date}</b>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Montant</p>
                    <b className="text-sm text-emerald-700">
                      {money(payment.amount)}
                    </b>
                  </div>
                </div>
                {payment.note && (
                  <p className="mt-3 text-sm text-stone-500">
                    Note : {payment.note}
                  </p>
                )}
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() =>
                    printReceipt({
                      receiptNo:
                        payment.receiptNo || `REC-${payment.id.slice(0, 8)}`,
                      school: s.schoolName,
                      student:
                        students.find((student) => student.id === payStudent)
                          ?.name || "Élève",
                      group: group.name,
                      module: mod?.name || "",
                      date: payment.date,
                      amount: payment.amount,
                      note: payment.note,
                    })
                  }
                >
                  <Printer size={16} />
                  Imprimer ce bon
                </Button>
              </div>
            ))}
        </div>
      </Modal>
      <Modal
        open={modal === "reschedule"}
        onClose={() => setModal(null)}
        title="Déplacer la séance"
      >
        <form onSubmit={rescheduleSession} className="grid gap-4">
          <Field
            name="date"
            label="Nouvelle date"
            type="date"
            defaultValue={sessions.find((x) => x.id === selected)?.date}
            required
          />
          <Field
            name="topic"
            label="Sujet"
            defaultValue={sessions.find((x) => x.id === selected)?.topic}
            required
          />
          <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
            Seule cette séance sera déplacée. Le planning hebdomadaire du groupe ne changera pas.
          </p>
          <Button type="submit">Confirmer la nouvelle date</Button>
        </form>
      </Modal>
      <Modal
        open={modal === "payment"}
        onClose={() => setModal(null)}
        title="Enregistrer un paiement"
      >
        <form onSubmit={pay} className="grid gap-4">
          <Field
            name="amount"
            label="Montant payé (DA)"
            type="number"
            min="1"
            required
          />
          <Field
            name="date"
            label="Date d'encaissement"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
          <Field name="note" label="Note" />
          <Button type="submit">Confirmer le paiement</Button>
        </form>
      </Modal>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="grid min-h-48 place-items-center p-8 text-center text-sm text-stone-400">
      {text}
    </div>
  );
}

function sessionLabel(
  session: { date: string; topic: string; automatic?: boolean; movedFrom?: string },
  schedule: string,
) {
  if (!session.automatic) return session.topic;
  const weekdays = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const [year, month, day] = session.date.split("-").map(Number);
  const weekday = weekdays[new Date(year, month - 1, day).getDay()];
  const time = schedule.split(" ").slice(1).join(" ");
  return `${session.movedFrom ? "Séance déplacée" : "Séance programmée"} · ${weekday}${time ? ` ${time}` : ""}`;
}

function printReceipt(receipt: {
  receiptNo: string;
  school: string;
  student: string;
  group: string;
  module: string;
  date: string;
  amount: number;
  note: string;
}) {
  const safe = (value: string) =>
    value.replace(/[&<>'"]/g, (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] || character,
    );
  const popup = window.open("", "_blank", "width=760,height=700");
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>${safe(receipt.receiptNo)}</title><style>
  *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#18201d;margin:0;padding:40px}.receipt{max-width:680px;margin:auto;border:1px solid #d9ddd9;border-radius:18px;padding:32px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #178568;padding-bottom:20px}.brand{font-size:22px;font-weight:700}.badge{color:#087a58;background:#e9faf3;padding:8px 14px;border-radius:999px;font-weight:700}.number{margin-top:28px;color:#777;font-size:13px}.student{font-size:25px;font-weight:700;margin:8px 0}.muted{color:#777}.details{display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#f6f7f5;border-radius:14px;padding:22px;margin-top:24px}.label{color:#888;font-size:13px;margin-bottom:6px}.value{font-size:18px;font-weight:700}.amount{color:#087a58}.note{margin-top:22px}.footer{margin-top:36px;border-top:1px solid #ddd;padding-top:18px;color:#888;font-size:12px;text-align:center}@media print{body{padding:0}.receipt{border:0}.no-print{display:none}}</style></head><body><div class="receipt"><div class="head"><div><div class="brand">${safe(receipt.school)}</div><div class="muted">Bon d'encaissement</div></div><span class="badge">Encaissé</span></div><div class="number">REÇU ${safe(receipt.receiptNo)}</div><div class="student">${safe(receipt.student)}</div><div class="muted">${safe(receipt.group)} · ${safe(receipt.module)}</div><div class="details"><div><div class="label">Date d'encaissement</div><div class="value">${safe(receipt.date)}</div></div><div><div class="label">Montant encaissé</div><div class="value amount">${safe(money(receipt.amount))}</div></div></div>${receipt.note ? `<div class="note"><b>Note :</b> ${safe(receipt.note)}</div>` : ""}<div class="footer">Ce document confirme la réception du paiement indiqué ci-dessus.</div></div><script>window.onload=()=>{window.print()}<\/script></body></html>`);
  popup.document.close();
}
