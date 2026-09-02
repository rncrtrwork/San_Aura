import {
  hasFailedReadinessChecks,
  validateProductionCloudinaryEnvironment,
  validateProductionHostingEnvironment,
  validateProductionMonitoringEnvironment,
  validateProductionMongoEnvironment,
} from '@/lib/productionReadiness';

const checks = [
  ...validateProductionHostingEnvironment(process.env),
  ...validateProductionMongoEnvironment(process.env),
  ...validateProductionCloudinaryEnvironment(process.env),
  ...validateProductionMonitoringEnvironment(process.env),
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
