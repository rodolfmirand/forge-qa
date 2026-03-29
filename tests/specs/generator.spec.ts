import { expect, test } from "@playwright/test";
import { MockAIPlanningResolver } from "../../src/ai/planning/planning-resolver.js";
import { TemplateTestGenerator } from "../../src/core/generation/test-generator.js";
import { InMemoryAuditLogger } from "../../src/core/reporting/audit-log.js";

test("generator parses login credentials from flow text", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Login flow",
    sourceType: "text",
    content:
      "Abra a pagina e faca login usando as credenciais:\n- email: edoc@gmail.com\n- senha: abc123",
    targetUrl: "https://example.com/login"
  });

  const emailStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("email")
  );
  const passwordStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("password")
  );
  const clickStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("authentication form")
  );

  expect(emailStep?.value).toBe("edoc@gmail.com");
  expect(passwordStep?.value).toBe("abc123");
  expect(clickStep?.fallbackSelectors?.length).toBeGreaterThan(0);
});

test("generator inserts entry discovery when the target URL is not a login page", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Portal login flow",
    sourceType: "text",
    content:
      "Acesse o site, faca login com as credenciais abaixo e valide que o usuario chegou ao Dashboard:\n- email: edoc@gmail.com\n- senha: abc123",
    targetUrl: "https://example.com"
  });

  const entryStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("authentication entry point")
  );
  const assertTextStep = scenario.steps.find((step) => step.kind === "assertText");

  expect(entryStep).toBeDefined();
  expect(entryStep?.waitForNavigation).toBeTruthy();
  expect(entryStep?.fallbackSelectors).toContain('button:has-text("Entrar")');
  expect(assertTextStep?.text).toBe("Dashboard");
});

test("generator plans a search flow beyond authentication", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Search flow",
    sourceType: "text",
    content: 'Pesquise por "Forge QA" e valide que o texto "Results for: Forge QA" apareca.',
    targetUrl: "https://example.com/docs"
  });

  const fillStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("search field")
  );
  const pressStep = scenario.steps.find(
    (step) => step.kind === "press" && step.description.includes("search query")
  );
  const assertTextStep = scenario.steps.find((step) => step.kind === "assertText");

  expect(fillStep?.value).toBe("Forge QA");
  expect(pressStep?.key).toBe("Enter");
  expect(assertTextStep?.text).toBe("Results for: Forge QA");
});

test("generator plans a multi-step service crud flow with intermediate checkpoints", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Service registration flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Organizacao > Servicos e cadastre um servico com:\n- nome: Consulta Premium\n- categoria: Telemedicina\n- valor: 150\nValide que o texto "Servico salvo com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const organizationStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("organization area")
  );
  const servicesStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("service module")
  );
  const categoryStep = scenario.steps.find(
    (step) => step.kind === "select" && step.description.includes("service category")
  );
  const saveStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("Save the new service")
  );
  const assertTextSteps = scenario.steps.filter((step) => step.kind === "assertText");

  expect(organizationStep?.fallbackSelectors).toContain('button:has-text("Organizacao")');
  expect(servicesStep?.fallbackSelectors).toContain('button:has-text("Servicos")');
  expect(categoryStep?.value).toBe("Telemedicina");
  expect(saveStep?.fallbackSelectors).toContain('button:has-text("Save service")');
  expect(assertTextSteps.map((step) => step.text)).toEqual(
    expect.arrayContaining([
      "Organization overview loaded.",
      "Novo servico",
      "Nome do servico",
      "Servico salvo com sucesso"
    ])
  );
});

test("generator plans entity-oriented contact crud from labeled fields", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "Contact registration flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Organizacao > Contatos e cadastre um contato com:\n- nome: Ana Silva\n- cargo: Gestora\n- email: ana.silva@example.com\nValide que o texto "Contato salvo com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const contactsStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("contact module")
  );
  const roleStep = scenario.steps.find(
    (step) => step.kind === "select" && step.description.includes("contact role")
  );
  const emailStep = scenario.steps.find(
    (step) => step.kind === "fill" && step.description.includes("contact email")
  );
  const assertTextSteps = scenario.steps.filter((step) => step.kind === "assertText");

  expect(contactsStep?.fallbackSelectors).toContain('button:has-text("Contatos")');
  expect(roleStep?.value).toBe("Gestora");
  expect(emailStep?.value).toBe("ana.silva@example.com");
  expect(assertTextSteps.map((step) => step.text)).toEqual(
    expect.arrayContaining([
      "Organization overview loaded.",
      "Novo contato",
      "Nome do contato",
      "Contato salvo com sucesso"
    ])
  );
});

test("generator plans internal navigation and complex form interactions for user crud", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "User registration flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e cadastre um usuario com:\n- nome: Marina Costa\n- cargo: Gestora\n- notificacoes: sim\n- nivel de acesso: Admin\nValide que o texto "Usuario salvo com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const administrationStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("administration area")
  );
  const usersStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("users module")
  );
  const notificationsStep = scenario.steps.find(
    (step) => step.kind === "check" && step.description.includes("notifications")
  );
  const accessLevelStep = scenario.steps.find(
    (step) => step.kind === "check" && step.description.includes("access level")
  );
  const assertTextSteps = scenario.steps.filter((step) => step.kind === "assertText");

  expect(administrationStep?.fallbackSelectors).toContain('button:has-text("Administracao")');
  expect(usersStep?.fallbackSelectors).toContain('button:has-text("Usuarios")');
  expect(notificationsStep?.selector).toBe('input[name="user-notifications"]');
  expect(accessLevelStep?.selector).toBe('input[name="user-access-level"][value="Admin"]');
  expect(assertTextSteps.map((step) => step.text)).toEqual(
    expect.arrayContaining([
      "Administration center loaded.",
      "Novo usuario",
      "Cadastro de usuario",
      "Marina Costa",
      "Usuario salvo com sucesso"
    ])
  );
});

test("generator plans user update flow with targeted row action", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "User update flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e edite um usuario com:\n- usuario alvo: Carlos Mendes\n- cargo: Financeiro\n- nivel de acesso: Editor\nValide que o texto "Usuario atualizado com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const editStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("for editing")
  );
  const roleStep = scenario.steps.find(
    (step) => step.kind === "select" && step.description.includes("user role")
  );
  const accessLevelStep = scenario.steps.find(
    (step) => step.kind === "check" && step.description.includes("access level")
  );
  const assertTextSteps = scenario.steps.filter((step) => step.kind === "assertText");

  expect(editStep?.fallbackSelectors).toContain('button:has-text("Editar Carlos Mendes")');
  expect(roleStep?.value).toBe("Financeiro");
  expect(accessLevelStep?.selector).toBe('input[name="user-access-level"][value="Editor"]');
  expect(assertTextSteps.map((step) => step.text)).toEqual(
    expect.arrayContaining(["Carlos Mendes", "Usuario atualizado com sucesso"])
  );
});

test("generator plans user delete flow with targeted row action", async () => {
  const generator = new TemplateTestGenerator();
  const scenario = await generator.generate({
    title: "User delete flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e remova um usuario com:\n- usuario alvo: Carlos Mendes\nValide que o texto "Usuario removido com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const removeStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("Remove the existing user")
  );
  const assertTextSteps = scenario.steps.filter((step) => step.kind === "assertText");

  expect(removeStep?.fallbackSelectors).toContain('button:has-text("Remover Carlos Mendes")');
  expect(assertTextSteps.map((step) => step.text)).toEqual(
    expect.arrayContaining(["Carlos Mendes", "Usuario removido com sucesso"])
  );
});

test("generator escalates to ai planning for ambiguous CRUD wording", async () => {
  const auditLogger = new InMemoryAuditLogger();
  const generator = new TemplateTestGenerator(auditLogger, {
    planningMode: "hybrid",
    planningResolver: new MockAIPlanningResolver()
  });
  const scenario = await generator.generate({
    title: "Ambiguous user update flow",
    sourceType: "text",
    content:
      'Acesse a area autenticada, abra Administracao > Usuarios e ajuste um usuario com:\n- usuario alvo: Carlos Mendes\n- cargo: Financeiro\n- nivel de acesso: Editor\nValide que o texto "Usuario atualizado com sucesso" apareca.',
    targetUrl: "https://example.com/app"
  });

  const generationEntry = auditLogger.getEntries().find((entry) => entry.type === "generation");
  const editStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("for editing")
  );

  expect(editStep).toBeDefined();
  expect(generationEntry?.payload).toMatchObject({
    planning: {
      mode: "hybrid",
      strategy: "ai",
      escalationReason: "ambiguous-crud-language"
    }
  });
});

test("generator normalizes endpoint source payload into a complex CRUD plan", async () => {
  const auditLogger = new InMemoryAuditLogger();
  const generator = new TemplateTestGenerator(auditLogger);
  const scenario = await generator.generate({
    title: "Endpoint user update flow",
    sourceType: "endpoint",
    content: "",
    targetUrl: "https://example.com/app",
    sourcePayload: {
      operation: "update",
      entity: "user",
      navigationPath: ["Administracao", "Usuarios"],
      targetRecord: "Carlos Mendes",
      fields: {
        cargo: "Financeiro",
        "nivel de acesso": "Editor"
      },
      expectedText: "Usuario atualizado com sucesso"
    }
  });

  const generationEntry = auditLogger.getEntries().find((entry) => entry.type === "generation");
  const editStep = scenario.steps.find(
    (step) => step.kind === "click" && step.description.includes("for editing")
  );
  const accessLevelStep = scenario.steps.find(
    (step) => step.kind === "check" && step.description.includes("access level")
  );

  expect(editStep?.fallbackSelectors).toContain('button:has-text("Editar Carlos Mendes")');
  expect(accessLevelStep?.selector).toBe('input[name="user-access-level"][value="Editor"]');
  expect(generationEntry?.payload).toMatchObject({
    normalizedInput: {
      sourceType: "endpoint",
      content: expect.stringContaining("abra Administracao > Usuarios e edite um user")
    }
  });
});
