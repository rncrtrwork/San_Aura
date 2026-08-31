import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES } from '@/server/auth/permissions';

export async function seedRoles(): Promise<void> {
  await connectToDatabase();

  await Promise.all(
    ROLE_NAMES.map((name) =>
      Role.updateOne(
        { name },
        { $set: { permissions: [...DEFAULT_ROLE_PERMISSIONS[name]] } },
        { upsert: true },
      ),
    ),
  );
}

if (require.main === module) {
  seedRoles()
    .then(() => {
      process.exitCode = 0;
    })
    .catch((error: Error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
