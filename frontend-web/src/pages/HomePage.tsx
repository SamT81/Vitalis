import {
  ArrowRight,
  Heart,
  HeartHandshake,
  LogIn,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

const STATS = [
  { value: '12,400+', label: 'Donantes activos' },
  { value: '38,200', label: 'Unidades donadas' },
  { value: '9,700', label: 'Vidas asistidas' },
];

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Gamificación real',
    desc: 'Gana puntos, sube de nivel y desbloquea insignias de "Héroe" cada vez que donas sangre.',
  },
  {
    icon: HeartHandshake,
    title: 'Impacto personalizado',
    desc: 'Entérate exactamente a qué hospital y a cuántas personas ayudó tu última donación.',
  },
  {
    icon: MapPin,
    title: 'Campañas cercanas',
    desc: 'Encuentra jornadas de la red RIBAS cerca de ti e inscríbete en un clic, sin llamadas ni filas.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate como donante con tus datos básicos y tu tipo de sangre en menos de dos minutos.',
  },
  {
    n: '02',
    title: 'Elige una campaña',
    desc: 'Explora las jornadas activas y próximas de la red y reserva tu cupo cuando te convenga.',
  },
  {
    n: '03',
    title: 'Dona y sigue tu impacto',
    desc: 'Acumula puntos, sube de nivel y mira en tiempo real la vida que ayudaste a salvar.',
  },
];

const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className={`${container} pb-16 pt-12 text-center sm:pt-20`}>
        <Badge variant="pill" className="mb-6">
          <Heart className="size-3.5" aria-hidden /> Red Interinstitucional de Bancos de Sangre
        </Badge>
        <h1 className="mx-auto max-w-3xl text-[clamp(2.1rem,6vw,3.6rem)] leading-[1.1] text-slate-900">
          Cada donación es una vida que continúa
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          Vitalis conecta los bancos de sangre de la red RIBAS en una sola plataforma: encuentra
          campañas, agenda tu donación y sigue en tiempo real el impacto de cada componente
          sanguíneo que das.
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
          Tecnología al servicio de la vida
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link to="/cuenta">
                Ir a mi cuenta <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link to="/login">
                <LogIn aria-hidden /> Iniciar sesión
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link to="/registro">
              <UserPlus aria-hidden /> Registrarme como donante
            </Link>
          </Button>
        </div>

        <dl className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-slate-600">{stat.label}</dt>
              <dd className="text-xl font-semibold text-slate-900 sm:text-2xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Misión institucional */}
      <section className={`${container} pb-16`}>
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-14">
          <span
            aria-hidden
            className="absolute -right-24 -top-24 size-80 rounded-full bg-primary-600/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-400">
              <Target className="size-4" aria-hidden /> Nuestra misión
            </p>
            <p className="text-[clamp(1.1rem,2.4vw,1.6rem)] font-medium leading-normal text-white">
              <span className="text-primary-400">“</span>Conectar y optimizar la Red
              Interinstitucional de Bancos de Sangre (RIBAS) mediante una plataforma tecnológica
              eficiente, ágil y transparente que facilite la gestión, donación y distribución
              oportuna de componentes sanguíneos para salvar vidas.
              <span className="text-primary-400">”</span>
            </p>
            <p className="mt-6 text-sm text-slate-300">— Vitalis · RIBAS</p>
          </div>
        </div>
      </section>

      {/* Pilares de la red */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-14 sm:py-20">
        <div className={container}>
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl text-slate-900">Una red, muchos bancos de sangre</h2>
            <p className="mt-3 text-slate-600">
              Todo lo que necesitas para convertir la donación en un hábito, sin fricción.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="h-full rounded-2xl border border-slate-100 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/40"
              >
                <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mb-2 text-base">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className={`${container} py-14 sm:py-20`}>
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl text-slate-900">Cómo funciona</h2>
          <p className="mt-3 text-slate-600">Tres pasos entre tú y tu próxima donación.</p>
        </div>
        <ol className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {STEPS.map((step) => (
            <li key={step.n}>
              <span aria-hidden className="text-5xl font-semibold leading-none text-slate-200">
                {step.n}
              </span>
              <h3 className="my-2 text-base">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className={`${container} pb-20`}>
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center">
          <span
            aria-hidden
            className="absolute -right-16 -top-16 size-64 rounded-full bg-primary-600/25 blur-3xl"
          />
          <span
            aria-hidden
            className="absolute -bottom-16 -left-16 size-64 rounded-full bg-primary-600/15 blur-3xl"
          />
          <div className="relative">
            <ShieldCheck className="mx-auto mb-4 size-8 text-primary-400" aria-hidden />
            <h2 className="mx-auto max-w-md text-2xl text-white sm:text-[1.7rem]">
              Únete a la red de donantes y empieza a sumar estrellas
            </h2>
            <Button variant="light" size="lg" className="mt-6" asChild>
              <Link to="/registro">
                Registrarme como donante <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-8">
        <div
          className={`${container} flex flex-col items-center justify-center gap-2 text-center sm:flex-row`}
        >
          <ShieldCheck className="size-4 shrink-0 text-slate-500" aria-hidden />
          <p className="max-w-3xl text-xs text-slate-600">
            Tus datos y resultados de tamizaje se manejan de forma confidencial, conforme al Decreto
            1571 de 1993 y la normativa de protección de datos vigente en Colombia.
          </p>
        </div>
      </section>
    </>
  );
}
