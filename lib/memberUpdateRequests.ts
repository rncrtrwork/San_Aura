export const MEMBER_UPDATE_REQUEST_TOPICS = [
  'contact',
  'membership',
  'documents',
  'billing',
  'other',
] as const;

export type MemberUpdateRequestTopic = (typeof MEMBER_UPDATE_REQUEST_TOPICS)[number];

export type MemberUpdateRequestCreateRequest = {
  topic: MemberUpdateRequestTopic;
  message: string;
};

export type MemberUpdateRequestCreateInput = {
  topic?: string;
  message?: string;
};

export type MemberUpdateRequestCreateResponse = {
  id?: string;
  message?: string;
};

export const MEMBER_UPDATE_REQUEST_TOPIC_LABELS: Record<MemberUpdateRequestTopic, string> = {
  contact: 'Contact information',
  membership: 'Membership details',
  documents: 'Documents on file',
  billing: 'Billing or payments',
  other: 'Something else',
};

export function isMemberUpdateRequestTopic(value: string): value is MemberUpdateRequestTopic {
  return MEMBER_UPDATE_REQUEST_TOPICS.some((topic) => topic === value);
}

export function validateMemberUpdateRequest(
  body: MemberUpdateRequestCreateInput | null,
): MemberUpdateRequestCreateRequest | string {
  if (!body || typeof body.topic !== 'string' || typeof body.message !== 'string') {
    return 'Choose a topic and enter a message.';
  }

  const message = body.message.trim();
  if (!isMemberUpdateRequestTopic(body.topic)) {
    return 'Choose a valid request topic.';
  }
  if (message.length < 10) {
    return 'Enter at least 10 characters so staff knows what to update.';
  }
  if (message.length > 2000) {
    return 'Keep the request under 2,000 characters.';
  }

  return {
    topic: body.topic,
    message,
  };
}
