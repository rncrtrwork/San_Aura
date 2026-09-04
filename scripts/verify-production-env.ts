import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  hasFailedReadinessChecks,
  type ProductionEnvironment,
  validateProductionCloudinaryEnvironment,
  validateProductionHostingEnvironment,
  validateProductionMonitoringEnvironment,
  validateProductionMongoEnvironment,
} from '@/lib/productionReadiness';

const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed.at(0);
  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseEnvFile(filePath: string): ProductionEnvironment {
  const entries: ProductionEnvironment = {};
  const content = readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    entries[key] = normalizeEnvValue(line.slice(separatorIndex + 1));
  }

  return entries;
}

function loadProductionEnvironment(): ProductionEnvironment {
  const fileEnvironment = envFiles.reduce<ProductionEnvironment>((environment, envFile) => {
    const filePath = resolve(process.cwd(), envFile);
    if (!existsSync(filePath)) {
      return environment;
    }

    return { ...environment, ...parseEnvFile(filePath) };
  }, {});

  return { ...fileEnvironment, ...process.env };
}

const productionEnvironment = loadProductionEnvironment();

const checks = [
  ...validateProductionHostingEnvironment(productionEnvironment),
  ...validateProductionMongoEnvironment(productionEnvironment),
  ...validateProductionCloudinaryEnvironment(productionEnvironment),
  ...validateProductionMonitoringEnvironment(productionEnvironment),
];

const report = checks
  .map((check) => {
    const marker = check.status === 'pass' ? 'PASS' : 'FAIL';
    return `${marker} ${check.label}: ${check.detail}`;
  })
  .join('\n');

process.stdout.write(`${report}\n`);

if (hasFailedReadinessChecks(checks)) {
  process.stderr.write('Production readiness failed. Fix the failed checks before launch.\n');
  process.exitCode = 1;
} else {
  process.stdout.write('Production readiness passed.\n');
}
