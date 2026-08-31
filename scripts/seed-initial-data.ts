import { connectToDatabase } from '@/lib/db';
import { PropertySettings } from '@/models/PropertySettings';
import { Role } from '@/models/Role';
import { User } from '@/models/User';
import { seedRoles } from '@/scripts/seed-roles';

type InitialAdminEnvironment = {
  name: string;
  email: string;
  password: string;
};

function getInitialAdminEnvironment(): InitialAdminEnvironment {
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD are required',
    );
  }

  return { name, email, password };
}

async function seedInitialData(): Promise<void> {
  const initialAdmin = getInitialAdminEnvironment();
  await seedRoles();
  await connectToDatabase();

  const adminRole = await Role.findOne({ name: 'Admin' });
  if (!adminRole) {
    throw new Error('Admin role was not created');
  }

  const existingAdmin = await User.findOne({ email: initialAdmin.email }).select('+passwordHash');

  if (existingAdmin) {
    existingAdmin.name = initialAdmin.name;
    existingAdmin.roleId = adminRole._id;
    existingAdmin.active = true;
    await existingAdmin.save();
  } else {
    const admin = new User({
      name: initialAdmin.name,
      email: initialAdmin.email,
      passwordHash: 'pending',
      roleId: adminRole._id,
      active: true,
    });
    await admin.setPassword(initialAdmin.password);
    await admin.save();
  }

  await PropertySettings.updateOne(
    { key: 'property' },
    {
      $setOnInsert: {
        resortName: 'Sun Aura Resort',
        address: {
          street: '3449 East State Road 10',
          city: 'Lake Village',
          state: 'Indiana',
          postalCode: '46349',
          country: 'United States',
        },
        phone: '219-345-2000',
        email: 'sunauraresort@outlook.com',
        timezone: 'America/Chicago',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        keyReturnTime: '11:00',
        cancellationWindowDays: 7,
        depositRequirementPercent: 25,
        minimumAge: 21,
        defaultMinimumStay: 1,
        openYearRound: true,
        taxRatePercent: 0,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        privacy: {
          photographyProhibited: true,
          videoProhibited: true,
          showPrivacyNoticeAtBooking: true,
        },
        notifications: {
          newReservation: true,
          cancellation: true,
          paymentRecorded: true,
          arrivalReminder: true,
        },
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
}

seedInitialData()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
