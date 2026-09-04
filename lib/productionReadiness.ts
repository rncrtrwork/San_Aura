import { getCloudinaryCredentials } from '@/lib/cloudinary';

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

export function validateProductionCloudinaryEnvironment(
  env: ProductionEnvironment,
): ProductionReadinessCheck[] {
  const credentials = getCloudinaryCredentials(env);
  const validCloudName = Boolean(
    credentials?.cloudName && /^[a-z0-9_-]+$/i.test(credentials.cloudName),
  );
  const validApiKey = Boolean(credentials?.apiKey && /^[0-9]+$/.test(credentials.apiKey));

  return [
    createCheck(
      'cloudinary-credentials-present',
      'Cloudinary credentials are configured',
      credentials ? 'pass' : 'fail',
      credentials
        ? 'Cloudinary credentials are present.'
        : 'Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    ),
    createCheck(
      'cloudinary-cloud-name-format',
      'Cloudinary cloud name format is valid',
      validCloudName ? 'pass' : 'fail',
      validCloudName
        ? 'Cloudinary cloud name uses a safe identifier format.'
        : 'Use only letters, numbers, underscores, and dashes in CLOUDINARY_CLOUD_NAME.',
    ),
    createCheck(
      'cloudinary-api-key-format',
      'Cloudinary API key format is valid',
      validApiKey ? 'pass' : 'fail',
      validApiKey
        ? 'Cloudinary API key uses the expected numeric format.'
        : 'Use the numeric API key from the Cloudinary dashboard.',
    ),
  ];
}

function isValidHttpsUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProductionHostingEnvironment(
  env: ProductionEnvironment,
): ProductionReadinessCheck[] {
  const nodeEnvironment = env.NODE_ENV?.trim();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  const sessionSecret = env.SESSION_SECRET?.trim();
  const smtpPort = env.SMTP_PORT?.trim();
  const hasSmtpConfig =
    hasValue(env.SMTP_HOST) &&
    hasValue(smtpPort) &&
    hasValue(env.SMTP_USER) &&
    hasValue(env.SMTP_PASSWORD) &&
    hasValue(env.SMTP_FROM_EMAIL);
  const validSmtpPort = Boolean(smtpPort && Number.isInteger(Number(smtpPort)));

  return [
    createCheck(
      'node-env-production',
      'Node environment is production',
      nodeEnvironment === 'production' ? 'pass' : 'fail',
      nodeEnvironment === 'production'
        ? 'NODE_ENV is set to production.'
        : 'Set NODE_ENV to production in the hosting environment.',
    ),
    createCheck(
      'site-url-https',
      'Public site URL uses HTTPS',
      isValidHttpsUrl(siteUrl) ? 'pass' : 'fail',
      isValidHttpsUrl(siteUrl)
        ? 'NEXT_PUBLIC_SITE_URL is an HTTPS URL.'
        : 'Set NEXT_PUBLIC_SITE_URL to the final HTTPS production URL.',
    ),
    createCheck(
      'session-secret-length',
      'Session secret is strong',
      Boolean(sessionSecret && sessionSecret.length >= 32) ? 'pass' : 'fail',
      sessionSecret && sessionSecret.length >= 32
        ? 'SESSION_SECRET contains at least 32 characters.'
        : 'Set SESSION_SECRET to a random value with at least 32 characters.',
    ),
    createCheck(
      'smtp-config-complete',
      'SMTP configuration is complete',
      hasSmtpConfig && validSmtpPort ? 'pass' : 'fail',
      hasSmtpConfig && validSmtpPort
        ? 'SMTP host, port, user, password, and from address are configured.'
        : 'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_EMAIL.',
    ),
  ];
}

export function validateProductionMonitoringEnvironment(
  env: ProductionEnvironment,
): ProductionReadinessCheck[] {
  const dsn = env.SENTRY_DSN?.trim();
  const publicDsn = env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  const environment = env.SENTRY_ENVIRONMENT?.trim() ?? env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim();
  const authToken = env.SENTRY_AUTH_TOKEN?.trim();
  const org = env.SENTRY_ORG?.trim();
  const project = env.SENTRY_PROJECT?.trim();
  const hasRuntimeDsn = isValidHttpsUrl(dsn) && isValidHttpsUrl(publicDsn);
  const hasSourceMapConfig = hasValue(authToken) && hasValue(org) && hasValue(project);
  const validEnvironment = environment === 'production';

  return [
    createCheck(
      'sentry-dsn-configured',
      'Sentry runtime DSNs are configured',
      hasRuntimeDsn ? 'pass' : 'fail',
      hasRuntimeDsn
        ? 'Server and browser Sentry DSNs are configured.'
        : 'Set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN to the production Sentry DSN.',
    ),
    createCheck(
      'sentry-environment-production',
      'Sentry environment is production',
      validEnvironment ? 'pass' : 'fail',
      validEnvironment
        ? 'Sentry environment is set to production.'
        : 'Set SENTRY_ENVIRONMENT and NEXT_PUBLIC_SENTRY_ENVIRONMENT to production.',
    ),
    createCheck(
      'sentry-source-map-configured',
      'Sentry source map upload is configured',
      hasSourceMapConfig ? 'pass' : 'fail',
      hasSourceMapConfig
        ? 'Sentry org, project, and auth token are present for source maps.'
        : 'Set SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN for production builds.',
    ),
  ];
}

export function hasFailedReadinessChecks(checks: ProductionReadinessCheck[]): boolean {
  return checks.some((check) => check.status === 'fail');
}
