export type ReservationConfirmationInput = {
  recipientEmail: string;
  recipientName: string;
  reservationId: string;
  checkIn: Date;
  checkOut: Date;
  siteCode: string;
};

export type ReservationConfirmationResult = {
  accepted: boolean;
  deliveryMode: 'smtp-configured-stub' | 'local-stub';
};

export async function sendReservationConfirmation(
  input: ReservationConfirmationInput,
): Promise<ReservationConfirmationResult> {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM_EMAIL,
  );
  const accepted = Boolean(
    input.recipientEmail &&
      input.recipientName &&
      input.reservationId &&
      input.checkIn < input.checkOut &&
      input.siteCode,
  );
  return {
    accepted,
    deliveryMode: smtpConfigured ? 'smtp-configured-stub' : 'local-stub',
  };
}
