import type {
  GeneratedTestScenario,
  GeneratedTestStep,
  TestGenerationInput
} from "../../types/generation.js";

const ENTRY_POINT_LABELS = ["Entrar", "Acessar", "Login", "Sign in", "Log in"];
const ENTRY_POINT_HREFS = ["login", "signin", "sign-in", "auth", "entrar", "acessar"];
const SIGN_IN_LABELS = ["Entrar", "Acessar", "Login", "Sign in", "Continuar"];

function parseCredential(content: string, label: string): string | null {
  const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, "i");
  const match = content.match(regex);

  return match?.[1]?.trim() ?? null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildTextSelectors(label: string): string[] {
  return unique([
    `button:has-text("${label}")`,
    `a:has-text("${label}")`,
    `[role="button"]:has-text("${label}")`,
    `text=${label}`
  ]);
}

function extractQuotedLabels(content: string): string[] {
  const matches = [...content.matchAll(/["“”']([^"“”']{2,60})["“”']/g)];
  return unique(matches.map((match) => match[1]?.trim() ?? ""));
}

function inferExpectedText(content: string): string | null {
  const explicitMatch = content.match(
    /(valide|validate|confirme|confirm)\s+(que\s+)?(?:o\s+texto|a\s+pagina|page)?\s*(?:contenha|contains?|mostre|shows?)\s*["“”']([^"“”']+)["“”']/i
  );

  if (explicitMatch?.[3]) {
    return explicitMatch[3].trim();
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
  return /(login|log in|sign in|entrar|acessar|autentic|senha|password)/i.test(content);
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

export class HeuristicFlowPlanner {
  plan(input: TestGenerationInput): GeneratedTestScenario {
    const expectedText = inferExpectedText(input.content);
    const expectedUrlIncludes = inferExpectedUrlIncludes(input.content);
    const wantsAuthentication = isAuthenticationIntent(input.content);
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
