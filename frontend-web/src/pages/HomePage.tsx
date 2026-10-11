import { HOME_BENEFITS, HOME_CONTENT, HOME_STEPS, ROUTES } from '@ribas/shared';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { VitalMark } from '@/components/layout/VitalMark';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/features/auth';

const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10';

/** Los pasos bajan en escalera a partir de `md`: cada uno arranca más abajo que el anterior. */
const STEP_OFFSETS = ['', 'md:mt-16', 'md:mt-32'];

export function HomePage() {
  const { isAuthenticated } = useSession();

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden">
        <div
          className={`${container} grid items-center gap-x-10 gap-y-12 pb-section pt-12 sm:pt-16 lg:grid-cols-12 lg:pt-20`}
        >
          <div className="lg:col-span-7">
            <p className="rise text-sm font-medium text-slate-600">{HOME_CONTENT.pill}</p>
            <h1 className="rise mt-5 max-w-[13ch] font-display text-display-xl text-slate-900 [--i:1]">
              {HOME_CONTENT.title}
            </h1>
            <p className="rise mt-7 max-w-[54ch] text-lg leading-relaxed text-slate-600 [--i:2]">
              {HOME_CONTENT.lead}
            </p>

            <div className="rise mt-9 flex flex-col gap-3 [--i:3] sm:flex-row sm:items-center">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link to={ROUTES.ACCOUNT}>
                    Ir a mi cuenta <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link to={ROUTES.LOGIN}>Iniciar sesión</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link to={ROUTES.REGISTER}>Registrarme como donante</Link>
              </Button>
            </div>
          </div>

          <div className="rise relative [--i:2] lg:col-span-5">
            <VitalMark className="mx-auto max-w-[20rem] sm:max-w-sm lg:-mr-10 lg:max-w-none xl:-mr-20" />
            <p className="mt-4 text-center font-display text-xl italic text-slate-900 lg:absolute lg:bottom-6 lg:left-0 lg:mt-0 lg:max-w-[11ch] lg:text-left lg:text-2xl lg:leading-tight">
              {HOME_CONTENT.kicker}
            </p>
          </div>
        </div>
      </section>

      {/* Misión institucional */}
      <section className="bg-blush-100">
        <div className={`${container} py-section`}>
          <h2 className="text-sm font-semibold text-slate-900">{HOME_CONTENT.missionLabel}</h2>
          <blockquote className="mt-6 max-w-[34ch] font-display text-display-md text-slate-900 lg:ml-[16.666%] lg:max-w-[30ch] lg:text-display-lg lg:leading-[1.12]">
            <p>“{HOME_CONTENT.mission}”</p>
            <footer className="mt-8 font-sans text-base font-normal tracking-normal text-slate-700">
              {HOME_CONTENT.missionSign}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Pilares de la red */}
      <section className={`${container} grid gap-x-16 gap-y-10 py-section lg:grid-cols-12`}>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="max-w-[14ch] font-display text-display-lg text-slate-900">
              {HOME_CONTENT.benefitsTitle}
            </h2>
            <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-slate-600">
              {HOME_CONTENT.benefitsLead}
            </p>
          </div>
        </div>
        <ul className="lg:col-span-7">
          {HOME_BENEFITS.map(({ id, title, desc }) => (
            <li key={id} className="border-t border-slate-200 py-8 first:border-t-0 first:pt-0">
              <h3 className="font-display text-display-md text-slate-900">{title}</h3>
              <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-slate-600">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-slate-200">
        <div className={`${container} py-section`}>
          <h2 className="font-display text-display-lg text-slate-900">{HOME_CONTENT.stepsTitle}</h2>
          <p className="mt-4 text-lg text-slate-600">{HOME_CONTENT.stepsLead}</p>

          <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3 md:items-start">
            {HOME_STEPS.map((step, index) => (
              <li key={step.n} className={STEP_OFFSETS[index]}>
                <span
                  aria-hidden
                  className="block font-display text-[4.5rem] leading-none tracking-tight text-blush-400"
                >
                  {step.n}
                </span>
                <h3 className="mt-4 border-t border-slate-900 pt-4 text-lg text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-base leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className={`${container} pb-section`}>
        <div className="relative overflow-hidden rounded-panel bg-slate-900 px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <VitalMark
            tone="dark"
            className="pointer-events-none absolute -bottom-40 -right-24 hidden w-[26rem] md:block"
          />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-display-lg text-white">{HOME_CONTENT.ctaTitle}</h2>
            <Button variant="light" size="lg" className="mt-9" asChild>
              <Link to={ROUTES.REGISTER}>
                Registrarme como donante <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-600">
          {HOME_CONTENT.trust}
        </p>
      </section>
    </>
  );
}
