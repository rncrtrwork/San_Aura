import type { PublicEventRegistrationRequest } from '@/lib/eventRegistration';

type ValidRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  partySize: number;
};

type ValidationResult =
  | { valid: true; data: ValidRegistrationInput }
  | { valid: false; message: string };

export function validatePublicEventRegistration(
  body: PublicEventRegistrationRequest,
): ValidationResult {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const partySize = body.partySize;

  if (!name || name.length > 120) {
    return { valid: false, message: 'Enter your name.' };
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return { valid: false, message: 'Enter a valid email address.' };
  }
  if (!phone || phone.length > 30) {
    return { valid: false, message: 'Enter your phone number.' };
  }
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 100) {
    return { valid: false, message: 'Party size must be between 1 and 100.' };
  }

  return { valid: true, data: { name, email, phone, partySize } };
}
