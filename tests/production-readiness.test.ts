import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  hasFailedReadinessChecks,
  validateProductionCloudinaryEnvironment,
  validateProductionMongoEnvironment,
  type ProductionReadinessCheck,
} from '@/lib/productionReadiness';
import { CLOUDINARY_FOLDERS, isCloudinaryPublicIdInFolder } from '@/lib/cloudinaryFolders';

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

  it('accepts configured Cloudinary production credentials', () => {
    const checks = validateProductionCloudinaryEnvironment({
      CLOUDINARY_CLOUD_NAME: 'sun-aura-prod',
      CLOUDINARY_API_KEY: '123456789012345',
      CLOUDINARY_API_SECRET: 'cloudinary-secret',
    });

    assert.equal(hasFailedReadinessChecks(checks), false);
  });

  it('rejects incomplete Cloudinary production credentials', () => {
    const checks = validateProductionCloudinaryEnvironment({
      CLOUDINARY_CLOUD_NAME: 'sun aura prod',
      CLOUDINARY_API_KEY: 'abc',
      CLOUDINARY_API_SECRET: '',
    });

    assert.equal(checkStatus(checks, 'cloudinary-credentials-present'), 'fail');
    assert.equal(checkStatus(checks, 'cloudinary-cloud-name-format'), 'fail');
    assert.equal(checkStatus(checks, 'cloudinary-api-key-format'), 'fail');
    assert.equal(hasFailedReadinessChecks(checks), true);
  });

  it('keeps Cloudinary folder validation aligned to the production folder map', () => {
    assert.equal(
      isCloudinaryPublicIdInFolder('sun-aura/media/cabin', CLOUDINARY_FOLDERS.media),
      true,
    );
    assert.equal(
      isCloudinaryPublicIdInFolder('sun-aura/events/summer-social', CLOUDINARY_FOLDERS.events),
      true,
    );
    assert.equal(
      isCloudinaryPublicIdInFolder(
        'sun-aura/member-documents/insurance',
        CLOUDINARY_FOLDERS.memberDocuments,
      ),
      true,
    );
    assert.equal(
      isCloudinaryPublicIdInFolder('sun-aura/settings/logo', CLOUDINARY_FOLDERS.settings),
      true,
    );
    assert.equal(
      isCloudinaryPublicIdInFolder('sun-aura/events/wrong-folder', CLOUDINARY_FOLDERS.media),
      false,
    );
  });
});
