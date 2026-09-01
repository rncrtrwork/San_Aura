import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  hasFailedReadinessChecks,
  validateProductionMongoEnvironment,
  type ProductionReadinessCheck,
} from '@/lib/productionReadiness';

function checkStatus(
  checks: ProductionReadinessCheck[],
  id: string,
): ProductionReadinessCheck['status'] {
  const match = checks.find((check) => check.id === id);
  assert.ok(match);
  return match.status;
}

describe('production readiness checks', () => {
  it('accepts an Atlas MongoDB URI with a database name', () => {
    const checks = validateProductionMongoEnvironment({
      MONGODB_URI:
        'mongodb+srv://sun-aura-app:secret@sunaura-prod.abcd.mongodb.net/sun-aura-resort?retryWrites=true&w=majority',
    });

    assert.equal(hasFailedReadinessChecks(checks), false);
  });

  it('rejects local MongoDB URIs for production', () => {
    const checks = validateProductionMongoEnvironment({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/sun-aura-resort',
    });

    assert.equal(checkStatus(checks, 'mongodb-uri-atlas'), 'fail');
    assert.equal(checkStatus(checks, 'mongodb-uri-not-local'), 'fail');
    assert.equal(hasFailedReadinessChecks(checks), true);
  });

  it('rejects Atlas URIs without an explicit database name', () => {
    const checks = validateProductionMongoEnvironment({
      MONGODB_URI:
        'mongodb+srv://sun-aura-app:secret@sunaura-prod.abcd.mongodb.net/?retryWrites=true&w=majority',
    });

    assert.equal(checkStatus(checks, 'mongodb-database-name'), 'fail');
    assert.equal(hasFailedReadinessChecks(checks), true);
  });
});
