import { createLocalServer } from "./app/api/local-server.js";

async function main(): Promise<void> {
  const server = createLocalServer();
  await server.start();

  console.log(`Forge QA local app running at ${server.origin}`);
}

void main();
