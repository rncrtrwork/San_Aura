export type ProductionReadinessStatus = 'pass' | 'fail';

export type ProductionReadinessCheck = {
  id: string;
  label: string;
  status: ProductionReadinessStatus;
  detail: string;
};

export type ProductionEnvironment = Record<string, string | undefined>;

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function createCheck(
  id: string,
  label: string,
  status: ProductionReadinessStatus,
  detail: string,
): ProductionReadinessCheck {
  return { id, label, status, detail };
}

export function validateProductionMongoEnvironment(
  env: ProductionEnvironment,
): ProductionReadinessCheck[] {
  const mongoUri = env.MONGODB_URI?.trim();
  const hasMongoUri = hasValue(mongoUri);
  const usesAtlasSrvUri = Boolean(mongoUri?.startsWith('mongodb+srv://'));
  const usesLocalHost =
    Boolean(mongoUri?.includes('127.0.0.1')) || Boolean(mongoUri?.includes('localhost'));
  const includesDatabaseName = Boolean(
    mongoUri && /mongodb(?:\+srv)?:\/\/[^/]+\/[^/?#]+/.test(mongoUri),
  );

  return [
    createCheck(
      'mongodb-uri-present',
      'MongoDB URI is configured',
      hasMongoUri ? 'pass' : 'fail',
      hasMongoUri
        ? 'MONGODB_URI is present for production.'
        : 'Set MONGODB_URI to the production MongoDB Atlas connection string.',
    ),
    createCheck(
      'mongodb-uri-atlas',
      'MongoDB URI uses Atlas SRV format',
      usesAtlasSrvUri ? 'pass' : 'fail',
      usesAtlasSrvUri
        ? 'MONGODB_URI uses mongodb+srv for Atlas.'
        : 'Use the mongodb+srv Atlas driver connection string.',
    ),
    createCheck(
      'mongodb-uri-not-local',
      'MongoDB URI is not local',
      !usesLocalHost && hasMongoUri ? 'pass' : 'fail',
      !usesLocalHost && hasMongoUri
        ? 'MONGODB_URI does not point at localhost.'
        : 'Production must not use localhost or 127.0.0.1.',
    ),
    createCheck(
      'mongodb-database-name',
      'MongoDB URI includes database name',
      includesDatabaseName ? 'pass' : 'fail',
      includesDatabaseName
        ? 'MONGODB_URI includes an explicit database name.'
        : 'Append the production database name to the connection string.',
    ),
  ];
}

export function hasFailedReadinessChecks(checks: ProductionReadinessCheck[]): boolean {
  return checks.some((check) => check.status === 'fail');
}
