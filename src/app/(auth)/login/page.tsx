export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Atlas
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Connexion</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Page preparee pour l&apos;authentification utilisateur. La logique NextAuth,
          les formulaires React Hook Form et les validations Zod seront branches a
          l&apos;etape suivante.
        </p>
      </section>
    </main>
  );
}
