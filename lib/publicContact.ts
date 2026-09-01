export type PublicContactInfo = {
  resortName: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  keyReturnTime: string;
};

export function publicAddressLines(contact: PublicContactInfo): string[] {
  return [
    contact.address.street,
    `${contact.address.city}, ${contact.address.state} ${contact.address.postalCode}`,
    contact.address.country,
  ];
}

export function publicMailtoHref(email: string): string {
  return `mailto:${email}`;
}

export function publicTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}
