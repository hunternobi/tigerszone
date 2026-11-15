"use client"; // Error boundaries must be Client Components

// Last resort when the root layout itself fails: it replaces the whole document, so it brings its own
// <html> and <body> and cannot rely on the site's styles.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          background: "#0a0f3d",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>
          Da ist etwas schiefgelaufen
        </h1>
        <p style={{ margin: 0, maxWidth: "32rem", opacity: 0.85 }}>
          TigersZone konnte gerade nicht geladen werden. Versuch es bitte noch
          einmal.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            minHeight: "44px",
            padding: "0 20px",
            border: 0,
            borderRadius: "9999px",
            background: "#ffffff",
            color: "#0a0f3d",
            fontSize: "15px",
            fontWeight: 600,
          }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
