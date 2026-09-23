import logo from "@/assets/images/logo.png";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  updated?: string;
  children: ReactNode;
};

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-800 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <a href="/" className="inline-flex" aria-label="Padlupp home">
          <img src={logo} alt="Padlupp" className="h-9 w-auto" />
        </a>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {updated && <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>}
        <div className="mt-8 space-y-7 leading-7 [&_a]:font-semibold [&_a]:text-primary-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-slate-700 [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </main>
  );
}
