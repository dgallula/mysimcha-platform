/**
 * Minimal bootable shell — markdown docs remain in /docs.
 */
export default function DocsHomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>MySimcha Docs</h1>
      <p>
        Docs site shell is running. Canonical architecture markdown lives in the repository{" "}
        <code>/docs</code> folder.
      </p>
    </main>
  );
}
