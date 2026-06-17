import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center rounded-full bg-brand-500/10 px-4 py-1 text-sm font-semibold text-brand-100 ring-1 ring-brand-500/20">
            Private chat, beautifully built
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Chat With You
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300">
            Real-time messaging designed for close groups and private conversations.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/login" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400">
              Sign in
            </Link>
            <Link href="/register" className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
              Get started
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
