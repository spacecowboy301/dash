"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-error">
      <p>Dash could not reach its local database.</p>
      <h1>Start PostgreSQL, migrate, and seed.</h1>
      <code>pnpm db:migrate &amp;&amp; pnpm db:seed</code>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
