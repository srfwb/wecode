export const DEFAULT_FILES: Record<string, string> = {
  "/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>First steps</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>Welcome to WeCode</h1>
    <p>
      Edit <code>index.html</code> and <code>style.css</code>, then watch the
      preview update live.
    </p>
  </body>
</html>
`,
  "/style.css": `body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
  max-width: 40rem;
  margin: 0 auto;
  color: #222;
  line-height: 1.5;
}

h1 {
  color: #0066cc;
  margin-bottom: 1rem;
}

code {
  background: #f4f4f5;
  padding: 0.1em 0.35em;
  border-radius: 3px;
  font-size: 0.95em;
}
`,
};
