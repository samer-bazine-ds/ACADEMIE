import { ReactNode, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Search,
  Settings,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { Modal } from "./ui";
import { useAcademy } from "../lib/store";
import { supabase } from "../lib/supabase";
const nav = [
  ["/app", "Aperçu", LayoutDashboard],
  ["/app/levels", "Niveaux", Layers3],
  ["/app/teachers", "Enseignants", GraduationCap],
  ["/app/students", "Élèves", UsersRound],
  ["/app/payments", "Paiements", Wallet],
  ["/app/settings", "Paramètres", Settings],
] as const;
export default function Layout({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState("");
  const location = useLocation(),
    navigate = useNavigate(),
    schoolName = useAcademy((s) => s.schoolName),
    syncError = useAcademy((s) => s.syncError),
    loading = useAcademy((s) => s.loading);
  const label = location.pathname.startsWith("/app/group/")
    ? "Groupe"
    : nav.find((x) => x[0] === location.pathname)?.[1] || "Administration";
  const results = nav.filter(([, name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-cream text-ink">
      {drawer && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setDrawer(false)}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#10251f] p-4 text-white shadow-2xl transition-transform duration-300 lg:z-40 lg:w-64 lg:translate-x-0 lg:shadow-none ${drawer ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-7 flex items-center justify-between px-2 pt-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/20">
              <School size={21} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display font-bold">{schoolName}</p>
              <p className="text-xs text-white/45">Espace école</p>
            </div>
          </div>
          <button
            aria-label="Fermer"
            onClick={() => setDrawer(false)}
            className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="space-y-1" aria-label="Navigation principale">
          {nav.map(([to, name, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              onClick={() => setDrawer(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-white/[.12] text-white shadow-inner" : "text-white/55 hover:bg-white/[.06] hover:text-white"}`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
          className="mt-auto flex items-center gap-3 rounded-2xl bg-white/[.06] p-3 text-left transition hover:bg-white/[.1]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200 text-xs font-bold text-amber-800">
            AD
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm">Administrateur</b>
            <small className="text-white/45">Se déconnecter</small>
          </span>
          <LogOut size={17} className="text-white/40" />
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-black/[.06] bg-cream/90 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setDrawer(true)}
              className="rounded-xl border border-black/[.06] bg-white p-2.5 shadow-sm lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs text-stone-400 sm:block">
                Espace administration
              </p>
              <h1 className="truncate font-display text-lg font-bold sm:text-xl">
                {label}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-black/[.07] bg-white p-2.5 text-sm text-stone-500 shadow-sm transition hover:border-brand-500/30 sm:px-3"
          >
            <Search size={17} />
            <span className="hidden sm:inline">Rechercher…</span>
          </button>
        </header>
        <main className="p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
          {syncError&&<div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">Synchronisation impossible : {syncError}</div>}
          {loading&&<div className="mb-4 rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-700">Chargement des données sécurisées…</div>}
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-5 rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
        {nav.slice(0, 5).map(([to, name, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app"}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-stone-400"}`
            }
          >
            <Icon size={19} />
            <span className="truncate">{name}</span>
          </NavLink>
        ))}
      </nav>
      <Modal
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        title="Rechercher"
      >
        <div className="flex items-center gap-2 rounded-xl border px-3">
          <Search size={17} className="text-stone-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Page à ouvrir…"
            className="w-full py-3 outline-none"
          />
        </div>
        <div className="mt-3 space-y-1">
          {results.map(([to, name, Icon]) => (
            <button
              key={to}
              onClick={() => {
                navigate(to);
                setSearchOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-semibold hover:bg-stone-50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon size={17} />
              </span>
              {name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
