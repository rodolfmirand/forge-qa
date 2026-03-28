export function renderWebPanelHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forge QA</title>
    <style>
      :root {
        --bg: #f4efe8;
        --card: #fffaf2;
        --ink: #1d1b18;
        --muted: #665f57;
        --line: #d4c6b6;
        --accent: #b84c2a;
        --accent-soft: #f3d8cf;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, #f8d9b7 0, transparent 28%),
          radial-gradient(circle at bottom right, #d8e4c2 0, transparent 30%),
          var(--bg);
      }

      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }

      .hero {
        margin-bottom: 24px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 0.95;
      }

      p {
        margin: 0;
        color: var(--muted);
        max-width: 60ch;
      }

      .layout {
        display: grid;
        gap: 20px;
      }

      .card {
        background: color-mix(in srgb, var(--card) 92%, white 8%);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 12px 30px rgba(29, 27, 24, 0.06);
      }

      label {
        display: block;
        font-size: 0.95rem;
        margin-bottom: 8px;
      }

      input,
      textarea,
      button {
        width: 100%;
        font: inherit;
      }

      input,
      textarea {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
        background: white;
      }

      textarea {
        min-height: 140px;
        resize: vertical;
      }

      .field + .field {
        margin-top: 16px;
      }

      .actions {
        display: flex;
        gap: 12px;
        margin-top: 18px;
        flex-wrap: wrap;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        background: var(--accent);
        color: white;
        cursor: pointer;
      }

      button.secondary {
        background: var(--accent-soft);
        color: var(--ink);
      }

      .meta {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        margin-bottom: 16px;
      }

      .meta strong,
      .info strong {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }

      .meta span {
        display: block;
        margin-top: 6px;
        font-size: 1rem;
      }

      .info-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        margin-bottom: 16px;
      }

      .info {
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255, 255, 255, 0.5);
      }

      .info pre,
      .logs {
        margin: 8px 0 0;
        white-space: pre-wrap;
      }

      .artifact-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }

      .artifact-list a {
        color: var(--accent);
        text-decoration: none;
      }

      .artifact-list a:hover {
        text-decoration: underline;
      }

      .logs {
        border-radius: 16px;
        background: #201d19;
        color: #f6ede0;
        padding: 16px;
        overflow: auto;
        min-height: 220px;
      }

      .status-running {
        color: #8b5a00;
      }

      .status-passed {
        color: #1f6f3c;
      }

      .status-failed {
        color: #9e2c18;
      }

      @media (max-width: 640px) {
        .actions {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Forge QA</h1>
        <p>Informe uma URL e descreva o fluxo. O motor gera o cenario, executa o teste, mostra o plano, resume o resultado e preserva evidencias. Use as demos para ver planejamento e auto-cura de forma controlada.</p>
      </section>

      <section class="layout">
        <section class="card" id="execution-form">
          <div class="field">
            <label for="url">URL alvo</label>
            <input id="url" name="url" value="/fixtures/login-flow" />
          </div>
          <div class="field">
            <label for="flow">Fluxo em texto</label>
            <textarea id="flow" name="flow">Open the login page, submit the form and validate the dashboard state.</textarea>
          </div>
          <div class="actions">
            <button type="button" id="execute-button">Executar fluxo</button>
            <button type="button" class="secondary" id="prefill-button">Usar exemplo base</button>
            <button type="button" class="secondary" id="healing-demo-button">Usar demo de healing</button>
          </div>
        </section>

        <section class="card">
          <div class="meta">
            <div>
              <strong>Execucao</strong>
              <span id="execution-id">-</span>
            </div>
            <div>
              <strong>Status</strong>
              <span id="execution-status">Idle</span>
            </div>
            <div>
              <strong>Cenario</strong>
              <span id="scenario-title">-</span>
            </div>
          </div>
          <div class="info-grid">
            <div class="info">
              <strong>Resumo</strong>
              <pre id="execution-summary">Aguardando execucao...</pre>
            </div>
            <div class="info">
              <strong>Evidencias</strong>
              <div class="artifact-list" id="execution-artifacts">Aguardando execucao...</div>
            </div>
            <div class="info">
              <strong>Healing</strong>
              <pre id="execution-healing">Aguardando execucao...</pre>
            </div>
          </div>
          <div class="logs" id="execution-logs">Aguardando execucao...</div>
        </section>
      </section>
    </main>

    <script src="/app.js"></script>
  </body>
</html>`;
}
