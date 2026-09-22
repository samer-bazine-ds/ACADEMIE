import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Languages, School } from "lucide-react";
import { Button, Field } from "../components/ui";
import { useAcademy } from "../lib/store";
import { supabase } from "../lib/supabase";
export default function Login() {
  const formRef = useRef<HTMLFormElement>(null);
  const nav = useNavigate(),
    loginParent = useAcademy((s) => s.loginParent),switchSchool=useAcademy(s=>s.switchSchool);
  const [role, setRole] = useState<"school" | "parent">("school"),
    [signup, setSignup] = useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false);
  const resetPassword = async () => {
    setError(''); setNotice('');
    const email = String(new FormData(formRef.current!).get('email') || '').trim().toLowerCase();
    if (!email) { setError("Entrez d'abord votre adresse e-mail."); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setNotice('E-mail envoyé. Ouvrez le lien reçu pour choisir un nouveau mot de passe.');
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email')).trim().toLowerCase();
    const password = String(f.get('password'));
    if(role==='parent'){if(!loginParent(email,password)){setError('Identifiant ou date de naissance incorrecte.');return;}nav('/parent');return;}
    setLoading(true);
    try {
      if (signup) {
        const schoolName = String(f.get('school')).trim();
        const ownerName = String(f.get('owner')).trim();
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: 'school', school_name: schoolName, owner_name: ownerName } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setSignup(false);
          setError('Compte créé. Vérifiez votre e-mail, puis connectez-vous.');
          return;
        }
        switchSchool(email, schoolName);
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('school_id, role, schools(name)')
          .single();
        if (profileError || profile?.role !== 'school') {
          await supabase.auth.signOut();
          throw new Error("Ce compte n'est pas un compte école.");
        }
        const school = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
        switchSchool(email, (school as {name?: string} | null)?.name);
      }
      nav('/app');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Connexion impossible.';
      setError(message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#13241f] p-14 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500">
            <School />
          </span>
          <span className="font-display text-xl font-bold">Académie</span>
        </div>
        <div className="relative my-auto max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-brand-100">
            <Check size={14} />
            Conçu pour les écoles algériennes
          </span>
          <h1 className="font-display text-5xl font-bold leading-tight">
            L'administration scolaire, enfin{" "}
            <span className="text-[#79d8bb]">simple.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Créez votre école puis gérez niveaux, modules, enseignants et
            élèves.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-7">
            <div>
              <b className="text-2xl">5 ans</b>
              <p className="text-sm text-white/45">Primaire</p>
            </div>
            <div>
              <b className="text-2xl">4 ans</b>
              <p className="text-sm text-white/45">Moyen</p>
            </div>
            <div>
              <b className="text-2xl">3 ans</b>
              <p className="text-sm text-white/45">Secondaire</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/30">
          © 2026 Académie — Fait avec soin en Algérie
        </p>
      </section>
      <section className="relative grid place-items-center p-6">
        <button className="absolute right-6 top-6 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Languages size={16} />
          العربية
        </button>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
              <School />
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold">
            {signup ? "Créer votre école" : "Heureux de vous revoir"}
          </h2>
          <p className="mt-2 text-stone-500">
            {signup
              ? "Commencez à gérer votre établissement en quelques secondes."
              : "Connectez-vous à votre espace personnel."}
          </p>
          <div className="my-7 grid grid-cols-2 rounded-xl bg-stone-100 p-1">
            <button
              onClick={() => {
                setRole("school");
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold ${role === "school" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              École
            </button>
            <button
              onClick={() => {
                setRole("parent");
                setSignup(false);
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold ${role === "parent" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              Parent
            </button>
          </div>
          <form ref={formRef} className="grid gap-4" onSubmit={submit}>
            {signup && role === "school" && (
              <>
                <Field
                  name="school"
                  label="Nom de l'école"
                  required
                  placeholder="Ex. Académie El Amal"
                />
                <Field name="owner" label="Nom du responsable" required />
              </>
            )}
            <Field
              key={role}
              name="email"
              label={role==='parent'?'Identifiant parent':'Adresse e-mail'}
              type={role==='parent'?'text':'email'}
              required
              defaultValue=""
            />
            {role==='parent'&&<p className="-mt-2 text-xs text-stone-400">Exemple : EL.BENALI.001 · Mot de passe : date de naissance (JJ/MM/AAAA ou AAAA-MM-JJ)</p>}
            {error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
            {notice&&<p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{notice}</p>}
            <Field
              name="password"
              label="Mot de passe"
              type="password"
              required
              defaultValue=""
            />
            {!signup && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={loading || role !== 'school'}
                  className="text-sm font-semibold text-brand-700"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            <Button className="mt-2 h-12" disabled={loading}>
              {loading ? "Veuillez patienter…" : signup ? "Créer mon école" : "Se connecter"}
              <ArrowRight size={17} />
            </Button>
          </form>
          {role === "school" && (
            <button
              onClick={() => setSignup(!signup)}
              className="mt-5 w-full text-center text-sm font-semibold text-brand-700"
            >
              {signup
                ? "J’ai déjà un compte"
                : "Nouvelle école ? Créer un compte"}
            </button>
          )}
          <div className="mt-7 flex items-center gap-3 text-xs text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            <BookOpen size={14} />
            {signup
              ? "Les 12 niveaux sont créés automatiquement"
              : "Accès de démonstration"}
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
