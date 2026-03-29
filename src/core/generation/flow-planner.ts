import type {
  GeneratedTestScenario,
  GeneratedTestStep,
  TestGenerationInput
} from "../../types/generation.js";

const ENTRY_POINT_LABELS = ["Entrar", "Acessar", "Login", "Sign in", "Log in"];
const ENTRY_POINT_HREFS = ["login", "signin", "sign-in", "auth", "entrar", "acessar"];
const SIGN_IN_LABELS = ["Entrar", "Acessar", "Login", "Sign in", "Continuar"];

type CrudOperation = "create" | "update" | "delete";

interface SelectorTarget {
  selector: string;
  fallbackSelectors: string[];
}

interface NavigationSegmentConfig {
  description: string;
  labels: string[];
  hrefFragments: string[];
  checkpointText?: string;
}

interface CrudFieldConfig {
  key: string;
  labels: string[];
  kind: "fill" | "select" | "check";
  target: SelectorTarget | ((value: string) => SelectorTarget);
  defaultValue?: string;
  description: string;
  checkMode?: "boolean" | "option";
  isPrimary?: boolean;
}

interface CrudEntityConfig {
  id: string;
  keywords: RegExp;
  navigationPath: NavigationSegmentConfig[];
  targetRecordLabels: string[];
  createLabels: string[];
  createHrefFragments: string[];
  formCheckpointText: string;
  createSuccessText: string;
  updateSuccessText: string;
  deleteSuccessText: string;
  saveLabels: string[];
  fields: CrudFieldConfig[];
}

const ORGANIZATION_SEGMENT: NavigationSegmentConfig = {
  description: "Open the organization area.",
  labels: ["Organizacao", "Organização", "Organization"],
  hrefFragments: ["organization"],
  checkpointText: "Organization overview loaded."
};

const ADMINISTRATION_SEGMENT: NavigationSegmentConfig = {
  description: "Open the administration area.",
  labels: ["Administracao", "Administração", "Administration"],
  hrefFragments: ["administration", "admin"],
  checkpointText: "Administration center loaded."
};

function buildStaticTarget(selector: string, fallbackSelectors: string[] = []): SelectorTarget {
  return {
    selector,
    fallbackSelectors
  };
}

function buildCheckTarget(name: string, value: string): SelectorTarget {
  const escapedValue = escapeAttributeValue(value);

  return {
    selector: `input[name="${name}"][value="${escapedValue}"]`,
    fallbackSelectors: [
      `input[type="radio"][name="${name}"][value="${escapedValue}"]`,
      `input[value="${escapedValue}"]`
    ]
  };
}

const CRUD_ENTITY_CONFIGS: CrudEntityConfig[] = [
  {
    id: "service",
    keywords: /(servi[cç]o|service)/i,
    navigationPath: [
      ORGANIZATION_SEGMENT,
      {
        description: "Open the service module.",
        labels: ["Servicos", "Serviços", "Services"],
        hrefFragments: ["service", "servico"],
        checkpointText: "Novo servico"
      }
    ],
    targetRecordLabels: ["servico alvo", "serviço alvo", "alvo", "existente", "nome atual"],
    createLabels: ["Novo servico", "Novo serviço", "New service", "Cadastrar servico"],
    createHrefFragments: ["new-service"],
    formCheckpointText: "Nome do servico",
    createSuccessText: "Servico salvo com sucesso",
    updateSuccessText: "Servico atualizado com sucesso",
    deleteSuccessText: "Servico removido com sucesso",
    saveLabels: ["Salvar servico", "Salvar serviço", "Save service"],
    fields: [
      {
        key: "name",
        labels: ["nome", "name", "servico", "serviço", "service"],
        kind: "fill",
        target: buildStaticTarget('input[name="service-name"]', [
          'input[id*="service-name" i]',
          'input[name*="nome" i]',
          'input[name*="service" i]'
        ]),
        defaultValue: "Servico Premium",
        description: "Fill the service name field.",
        isPrimary: true
      },
      {
        key: "category",
        labels: ["categoria", "category", "tipo"],
        kind: "select",
        target: buildStaticTarget('select[name="service-category"]', [
          'select[id*="category" i]',
          'select[name*="categoria" i]'
        ]),
        defaultValue: "Telemedicina",
        description: "Choose the service category."
      },
      {
        key: "price",
        labels: ["valor", "preco", "preço", "price"],
        kind: "fill",
        target: buildStaticTarget('input[name="service-price"]', [
          'input[id*="price" i]',
          'input[name*="valor" i]',
          'input[name*="preco" i]'
        ]),
        defaultValue: "150",
        description: "Fill the service price field."
      }
    ]
  },
  {
    id: "contact",
    keywords: /(contato|contact)/i,
    navigationPath: [
      ORGANIZATION_SEGMENT,
      {
        description: "Open the contact module.",
        labels: ["Contatos", "Contacts"],
        hrefFragments: ["contact", "contato"],
        checkpointText: "Novo contato"
      }
    ],
    targetRecordLabels: ["contato alvo", "alvo", "existente", "nome atual"],
    createLabels: ["Novo contato", "New contact", "Cadastrar contato"],
    createHrefFragments: ["new-contact"],
    formCheckpointText: "Nome do contato",
    createSuccessText: "Contato salvo com sucesso",
    updateSuccessText: "Contato atualizado com sucesso",
    deleteSuccessText: "Contato removido com sucesso",
    saveLabels: ["Salvar contato", "Save contact"],
    fields: [
      {
        key: "name",
        labels: ["nome", "name", "contato", "contact"],
        kind: "fill",
        target: buildStaticTarget('input[name="contact-name"]', [
          'input[id*="contact-name" i]',
          'input[name*="contact" i]',
          'input[name*="nome" i]'
        ]),
        defaultValue: "Ana Silva",
        description: "Fill the contact name field.",
        isPrimary: true
      },
      {
        key: "role",
        labels: ["cargo", "role", "perfil"],
        kind: "select",
        target: buildStaticTarget('select[name="contact-role"]', [
          'select[id*="role" i]',
          'select[name*="cargo" i]'
        ]),
        defaultValue: "Gestora",
        description: "Choose the contact role."
      },
      {
        key: "email",
        labels: ["email", "e-mail"],
        kind: "fill",
        target: buildStaticTarget('input[name="contact-email"]', [
          'input[id*="contact-email" i]',
          'input[name*="email" i]',
          'input[type="email"]'
        ]),
        defaultValue: "ana.silva@example.com",
        description: "Fill the contact email field."
      }
    ]
  },
  {
    id: "user",
    keywords: /(usu[aá]rio|user|membro|member)/i,
    navigationPath: [
      ADMINISTRATION_SEGMENT,
      {
        description: "Open the users module.",
        labels: ["Usuarios", "Usuários", "Users"],
        hrefFragments: ["users", "usuarios"],
        checkpointText: "Novo usuario"
      }
    ],
    targetRecordLabels: [
      "usuario alvo",
      "usuário alvo",
      "alvo",
      "existente",
      "nome atual",
      "user target"
    ],
    createLabels: ["Novo usuario", "Novo usuário", "New user", "Cadastrar usuario"],
    createHrefFragments: ["new-user"],
    formCheckpointText: "Cadastro de usuario",
    createSuccessText: "Usuario salvo com sucesso",
    updateSuccessText: "Usuario atualizado com sucesso",
    deleteSuccessText: "Usuario removido com sucesso",
    saveLabels: ["Salvar usuario", "Salvar usuário", "Save user"],
    fields: [
      {
        key: "name",
        labels: ["nome", "name", "usuario", "usuário", "user"],
        kind: "fill",
        target: buildStaticTarget('input[name="user-name"]', [
          'input[id*="user-name" i]',
          'input[name*="user" i]',
          'input[name*="nome" i]'
        ]),
        defaultValue: "Marina Costa",
        description: "Fill the user name field.",
        isPrimary: true
      },
      {
        key: "role",
        labels: ["cargo", "role", "funcao", "função"],
        kind: "select",
        target: buildStaticTarget('select[name="user-role"]', [
          'select[id*="user-role" i]',
          'select[name*="role" i]',
          'select[name*="cargo" i]'
        ]),
        defaultValue: "Gestora",
        description: "Choose the user role."
      },
      {
        key: "notifications",
        labels: ["notificacoes", "notificações", "notifications"],
        kind: "check",
        target: buildStaticTarget('input[name="user-notifications"]', [
          'input[type="checkbox"][name*="notification" i]',
          'input[id*="notification" i]'
        ]),
        description: "Enable notifications for the user.",
        checkMode: "boolean"
      },
      {
        key: "accessLevel",
        labels: ["nivel de acesso", "nível de acesso", "access level", "perfil de acesso"],
        kind: "check",
        target: (value) => buildCheckTarget("user-access-level", value),
        defaultValue: "Admin",
        description: "Select the access level for the user.",
        checkMode: "option"
      }
    ]
  }
];

function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseCredential(content: string, label: string): string | null {
  const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, "i");
  const match = content.match(regex);

  return match?.[1]?.trim() ?? null;
}

function parseLabelledValue(content: string, labels: string[]): string | null {
  for (const label of labels) {
    const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, "i");
    const match = content.match(regex);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildTextSelectors(label: string): string[] {
  return unique([
    `button:has-text("${label}")`,
    `a:has-text("${label}")`,
    `[role="button"]:has-text("${label}")`,
    `[role="tab"]:has-text("${label}")`,
    `text=${label}`
  ]);
}

function buildNamedClickStep(
  description: string,
  labels: string[],
  hrefFragments: string[] = [],
  waitForNavigation = false
): GeneratedTestStep {
  const textSelectors = labels.flatMap((label) => buildTextSelectors(label));
  const hrefSelectors = hrefFragments.map((fragment) => `a[href*="${fragment}" i]`);

  return {
    kind: "click",
    description,
    selector: textSelectors[0] ?? hrefSelectors[0] ?? "body",
    fallbackSelectors: unique([...textSelectors, ...hrefSelectors]),
    ...(waitForNavigation ? { waitForNavigation: true } : {})
  };
}

function extractQuotedLabels(content: string): string[] {
  const matches = [...content.matchAll(/["“”']([^"“”']{2,60})["“”']/g)];
  return unique(matches.map((match) => match[1]?.trim() ?? ""));
}

function extractNavigationSegments(content: string): string[] {
  const match = content.match(/([A-Za-zÀ-ÿ0-9\s]+(?:>\s*[A-Za-zÀ-ÿ0-9\s]+)+)/);

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(">")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function inferExpectedText(content: string): string | null {
  const explicitVerbFirstMatch = content.match(
    /(valide|validate|confirme|confirm)\s+(que\s+)?(?:o\s+texto|a\s+pagina|page)?\s*(?:contenha|contains?|mostre|shows?|apare[cç]a)\s*["“”']([^"“”']+)["“”']/i
  );

  if (explicitVerbFirstMatch?.[3]) {
    return explicitVerbFirstMatch[3].trim();
  }

  const explicitQuotedTextMatch = content.match(
    /(valide|validate|confirme|confirm).{0,80}(?:texto|text).{0,10}["“”']([^"“”']+)["“”'].{0,30}(?:contenha|contains?|mostre|shows?|apare[cç]a)/i
  );

  if (explicitQuotedTextMatch?.[2]) {
    return explicitQuotedTextMatch[2].trim();
  }

  const lower = content.toLowerCase();

  if (lower.includes("dashboard")) {
    return "Dashboard";
  }

  if (lower.includes("home")) {
    return "Home";
  }

  if (lower.includes("painel")) {
    return "Painel";
  }

  return null;
}

function inferExpectedUrlIncludes(content: string): string | null {
  const explicitMatch = content.match(
    /(url|rota|path)\s+(?:deve\s+)?(?:conter|contains?)\s*["“”']([^"“”']+)["“”']/i
  );

  if (explicitMatch?.[2]) {
    return explicitMatch[2].trim();
  }

  const lower = content.toLowerCase();

  if (lower.includes("pagina de login") || lower.includes("tela de login")) {
    return "login";
  }

  return null;
}

function isAuthenticationIntent(content: string): boolean {
  return /(login|log in|sign in|credenciais|senha|password|autenticar|autenticacao|autenticação)/i.test(
    content
  );
}

function isSearchIntent(content: string): boolean {
  return /(search|pesquis|buscar|busque|procure|procura)/i.test(content);
}

function isCrudIntent(content: string): boolean {
  return /(cadastr|criar|create|editar|edit|atualizar|update|remov|deletar|delete|excluir|remove)/i.test(
    content
  );
}

function inferCrudOperation(content: string): CrudOperation {
  if (/(remov|deletar|delete|remove|excluir)/i.test(content)) {
    return "delete";
  }

  if (/(editar|edit|atualizar|update|alterar)/i.test(content)) {
    return "update";
  }

  return "create";
}

function findCrudEntityConfig(content: string): CrudEntityConfig | null {
  return CRUD_ENTITY_CONFIGS.find((config) => config.keywords.test(content)) ?? null;
}

function parseSearchQuery(content: string): string | null {
  const explicitMatch = content.match(
    /(pesquise|pesquisar|buscar|busque|search(?: for)?)\s+(?:por\s+)?["“”']([^"“”']+)["“”']/i
  );

  if (explicitMatch?.[2]) {
    return explicitMatch[2].trim();
  }

  const labelledMatch = content.match(/(termo|query|busca|pesquisa)\s*:\s*([^\n\r]+)/i);

  if (labelledMatch?.[2]) {
    return labelledMatch[2].trim();
  }

  const quotedLabels = extractQuotedLabels(content);
  return quotedLabels[0] ?? null;
}

function targetLooksLikeAuthenticationEntry(targetUrl?: string): boolean {
  if (!targetUrl) {
    return false;
  }

  return /(login|signin|sign-in|auth|entrar|acessar)/i.test(targetUrl);
}

function buildEntryPointStep(content: string): GeneratedTestStep {
  const quotedLabels = extractQuotedLabels(content);
  const preferredLabels = unique([...quotedLabels, ...ENTRY_POINT_LABELS]);
  const preferredSelectors = preferredLabels.flatMap((label) => buildTextSelectors(label));
  const hrefSelectors = ENTRY_POINT_HREFS.map((fragment) => `a[href*="${fragment}" i]`);

  return {
    kind: "click",
    description: "Open the authentication entry point.",
    selector: hrefSelectors[0] ?? 'a[href*="login" i]',
    fallbackSelectors: unique([...preferredSelectors, ...hrefSelectors]),
    waitForNavigation: true
  };
}

function buildAuthenticationSteps(content: string): GeneratedTestStep[] {
  const email = parseCredential(content, "email") ?? "qa@secondmind.dev";
  const password =
    parseCredential(content, "senha") ?? parseCredential(content, "password") ?? "super-secret";

  return [
    {
      kind: "fill",
      description: "Fill the email field.",
      selector: 'input[type="email"]',
      fallbackSelectors: [
        'input[autocomplete="username"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[name*="login" i]',
        'input[placeholder*="mail" i]',
        'input[placeholder*="e-mail" i]',
        'input[type="text"][name*="user" i]'
      ],
      value: email
    },
    {
      kind: "fill",
      description: "Fill the password field.",
      selector: 'input[type="password"]',
      fallbackSelectors: [
        'input[autocomplete="current-password"]',
        'input[name*="senha" i]',
        'input[id*="senha" i]',
        'input[name*="password" i]',
        'input[id*="password" i]'
      ],
      value: password
    },
    {
      kind: "click",
      description: "Submit the authentication form.",
      selector: 'button[type="submit"]',
      fallbackSelectors: unique([
        ...SIGN_IN_LABELS.flatMap((label) => buildTextSelectors(label)),
        'input[type="submit"]'
      ])
    }
  ];
}

function buildSearchSteps(content: string): GeneratedTestStep[] {
  const query = parseSearchQuery(content) ?? "forge qa";
  const searchFieldSelector = 'input[type="search"]';
  const searchFieldFallbacks = [
    'input[name*="search" i]',
    'input[id*="search" i]',
    'input[name*="query" i]',
    'input[name="q" i]',
    'input[placeholder*="search" i]',
    'input[placeholder*="pesquis" i]',
    'input[placeholder*="buscar" i]'
  ];

  return [
    {
      kind: "fill",
      description: "Fill the search field.",
      selector: searchFieldSelector,
      fallbackSelectors: searchFieldFallbacks,
      value: query
    },
    {
      kind: "press",
      description: "Submit the search query.",
      selector: searchFieldSelector,
      fallbackSelectors: searchFieldFallbacks,
      key: "Enter"
    }
  ];
}

function buildTextCheckpointStep(description: string, text: string): GeneratedTestStep {
  return {
    kind: "assertText",
    description,
    selector: `text=${text}`,
    text
  };
}

function resolveTarget(field: CrudFieldConfig, value: string): SelectorTarget {
  return typeof field.target === "function" ? field.target(value) : field.target;
}

function isTruthyValue(value: string): boolean {
  return /^(sim|yes|true|ativo|ativado|enabled|on|checked)$/i.test(value.trim());
}

function getPrimaryField(entity: CrudEntityConfig): CrudFieldConfig | null {
  return entity.fields.find((field) => field.isPrimary) ?? null;
}

function parseTargetRecordName(content: string, entity: CrudEntityConfig): string | null {
  return (
    parseLabelledValue(content, entity.targetRecordLabels) ??
    parseLabelledValue(content, getPrimaryField(entity)?.labels ?? [])
  );
}

function buildCrudFieldStep(
  content: string,
  field: CrudFieldConfig,
  useDefaultValue = true
): GeneratedTestStep | null {
  const parsedValue = parseLabelledValue(content, field.labels);
  const value = parsedValue ?? (useDefaultValue ? (field.defaultValue ?? null) : null);

  if (!value) {
    return null;
  }

  const target = resolveTarget(field, value);

  if (field.kind === "check") {
    if ((field.checkMode ?? "boolean") === "boolean" && !isTruthyValue(value)) {
      return null;
    }

    return {
      kind: "check",
      description: field.description,
      selector: target.selector,
      fallbackSelectors: target.fallbackSelectors
    };
  }

  return {
    kind: field.kind,
    description: field.description,
    selector: target.selector,
    fallbackSelectors: target.fallbackSelectors,
    value
  };
}

function buildNavigationSteps(content: string, entity: CrudEntityConfig): GeneratedTestStep[] {
  const preferredSegments = extractNavigationSegments(content);
  const steps: GeneratedTestStep[] = [];

  for (const [index, segment] of entity.navigationPath.entries()) {
    const preferredLabel = preferredSegments[index];
    const labels = preferredLabel ? unique([preferredLabel, ...segment.labels]) : segment.labels;

    steps.push(buildNamedClickStep(segment.description, labels, segment.hrefFragments));

    if (segment.checkpointText) {
      steps.push(
        buildTextCheckpointStep(
          `Validate that the ${segment.description.toLowerCase()} is visible.`,
          segment.checkpointText
        )
      );
    }
  }

  return steps;
}

function buildRowActionStep(
  action: "edit" | "delete",
  entity: CrudEntityConfig,
  targetName: string | null
): GeneratedTestStep {
  const normalizedName = targetName ?? `${entity.id} existente`;
  const labels =
    action === "edit"
      ? [`Editar ${normalizedName}`, `Edit ${normalizedName}`]
      : [`Remover ${normalizedName}`, `Delete ${normalizedName}`];

  return buildNamedClickStep(
    action === "edit"
      ? `Open the existing ${entity.id} for editing.`
      : `Remove the existing ${entity.id}.`,
    labels
  );
}

function buildCrudCreateSteps(content: string, entity: CrudEntityConfig): GeneratedTestStep[] {
  const fieldSteps = entity.fields
    .map((field) => ({
      config: field,
      step: buildCrudFieldStep(content, field, true)
    }))
    .filter(
      (candidate): candidate is { config: CrudFieldConfig; step: GeneratedTestStep } =>
        candidate.step !== null
    );
  const primaryField = fieldSteps.find((candidate) => candidate.config.isPrimary);
  const primaryValue = primaryField?.step.value;

  return [
    ...buildNavigationSteps(content, entity),
    buildNamedClickStep(
      `Start creating a new ${entity.id}.`,
      entity.createLabels,
      entity.createHrefFragments
    ),
    buildTextCheckpointStep(
      `Validate that the ${entity.id} form is visible.`,
      entity.formCheckpointText
    ),
    ...fieldSteps.map((candidate) => candidate.step),
    {
      kind: "click",
      description: `Save the new ${entity.id} registration.`,
      selector: buildTextSelectors(entity.saveLabels[0] ?? "Salvar")[0] ?? 'button[type="submit"]',
      fallbackSelectors: unique([
        ...entity.saveLabels.flatMap((label) => buildTextSelectors(label)),
        'button[type="submit"]'
      ])
    },
    ...(primaryValue
      ? [
          buildTextCheckpointStep(
            `Validate that the ${entity.id} appears in the results table.`,
            primaryValue
          )
        ]
      : [])
  ];
}

function buildCrudUpdateSteps(content: string, entity: CrudEntityConfig): GeneratedTestStep[] {
  const targetName = parseTargetRecordName(content, entity);
  const fieldSteps = entity.fields
    .map((field) => ({
      config: field,
      step: buildCrudFieldStep(content, field, false)
    }))
    .filter(
      (candidate): candidate is { config: CrudFieldConfig; step: GeneratedTestStep } =>
        candidate.step !== null
    );
  const primaryField = fieldSteps.find((candidate) => candidate.config.isPrimary);
  const primaryValue = primaryField?.step.value ?? targetName ?? null;

  return [
    ...buildNavigationSteps(content, entity),
    ...(targetName
      ? [
          buildTextCheckpointStep(
            `Validate that the target ${entity.id} is listed before editing.`,
            targetName
          )
        ]
      : []),
    buildRowActionStep("edit", entity, targetName),
    buildTextCheckpointStep(
      `Validate that the ${entity.id} form is visible for editing.`,
      entity.formCheckpointText
    ),
    ...fieldSteps.map((candidate) => candidate.step),
    {
      kind: "click",
      description: `Save the updated ${entity.id} registration.`,
      selector: buildTextSelectors(entity.saveLabels[0] ?? "Salvar")[0] ?? 'button[type="submit"]',
      fallbackSelectors: unique([
        ...entity.saveLabels.flatMap((label) => buildTextSelectors(label)),
        'button[type="submit"]'
      ])
    },
    ...(primaryValue
      ? [
          buildTextCheckpointStep(
            `Validate that the updated ${entity.id} remains visible in the results table.`,
            primaryValue
          )
        ]
      : [])
  ];
}

function buildCrudDeleteSteps(content: string, entity: CrudEntityConfig): GeneratedTestStep[] {
  const targetName = parseTargetRecordName(content, entity);

  return [
    ...buildNavigationSteps(content, entity),
    ...(targetName
      ? [
          buildTextCheckpointStep(
            `Validate that the target ${entity.id} is listed before removal.`,
            targetName
          )
        ]
      : []),
    buildRowActionStep("delete", entity, targetName)
  ];
}

function buildCrudSteps(
  content: string,
  entity: CrudEntityConfig,
  operation: CrudOperation
): GeneratedTestStep[] {
  switch (operation) {
    case "update":
      return buildCrudUpdateSteps(content, entity);
    case "delete":
      return buildCrudDeleteSteps(content, entity);
    default:
      return buildCrudCreateSteps(content, entity);
  }
}

function buildExplicitClickSteps(content: string): GeneratedTestStep[] {
  if (!/(click|clique)/i.test(content)) {
    return [];
  }

  const labels = extractQuotedLabels(content).filter(
    (label) =>
      !ENTRY_POINT_LABELS.some((entryLabel) => entryLabel.toLowerCase() === label.toLowerCase())
  );

  return labels.map((label) => {
    const selectors = buildTextSelectors(label);

    return {
      kind: "click" as const,
      description: `Click the "${label}" action.`,
      selector: selectors[0] ?? `text=${label}`,
      fallbackSelectors: selectors.slice(1)
    };
  });
}

function getCrudSuccessText(entity: CrudEntityConfig, operation: CrudOperation): string {
  switch (operation) {
    case "update":
      return entity.updateSuccessText;
    case "delete":
      return entity.deleteSuccessText;
    default:
      return entity.createSuccessText;
  }
}

export class HeuristicFlowPlanner {
  plan(input: TestGenerationInput): GeneratedTestScenario {
    const wantsCrud = isCrudIntent(input.content);
    const crudEntity = wantsCrud ? findCrudEntityConfig(input.content) : null;
    const crudOperation = crudEntity ? inferCrudOperation(input.content) : null;
    const expectedText =
      inferExpectedText(input.content) ??
      (crudEntity && crudOperation ? getCrudSuccessText(crudEntity, crudOperation) : null);
    const expectedUrlIncludes = inferExpectedUrlIncludes(input.content);
    const wantsAuthentication = isAuthenticationIntent(input.content);
    const wantsSearch = !wantsAuthentication && isSearchIntent(input.content);
    const targetIsAuthenticationEntry = targetLooksLikeAuthenticationEntry(input.targetUrl);
    const steps: GeneratedTestStep[] = [
      {
        kind: "navigate",
        description: "Open the target page.",
        url: input.targetUrl ?? "about:blank"
      }
    ];

    if (wantsAuthentication && !targetIsAuthenticationEntry) {
      steps.push(buildEntryPointStep(input.content));
    }

    if (wantsAuthentication) {
      steps.push(...buildAuthenticationSteps(input.content));

      if (crudEntity && crudOperation) {
        steps.push(...buildCrudSteps(input.content, crudEntity, crudOperation));
      }
    } else if (crudEntity && crudOperation) {
      steps.push(...buildCrudSteps(input.content, crudEntity, crudOperation));
    } else if (wantsSearch) {
      steps.push(...buildSearchSteps(input.content));
    } else {
      steps.push(...buildExplicitClickSteps(input.content));
    }

    if (expectedUrlIncludes) {
      steps.push({
        kind: "assertUrl",
        description: `Validate that the current URL contains ${expectedUrlIncludes}.`,
        urlIncludes: expectedUrlIncludes
      });
    }

    if (expectedText) {
      steps.push({
        kind: "assertText",
        description: `Validate that ${expectedText} is visible after execution.`,
        selector: `text=${expectedText}`,
        text: expectedText
      });
    }

    return {
      title: `Scenario for: ${input.title}`,
      sourceType: input.sourceType,
      preconditions: ["The application is available for test execution."],
      steps
    };
  }
}
