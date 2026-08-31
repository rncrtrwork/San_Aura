import { Types } from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import type { MemberPaymentCreateRequest, MemberPaymentCreateResponse } from '@/lib/paymentForms';
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  type PaymentMethod,
  type PaymentType,
} from '@/lib/paymentOptions';
import { Member } from '@/models/Member';
import { Payment } from '@/models/Payment';
import { logActivity } from '@/server/activity/logActivity';
import { authorizeRequest } from '@/server/auth/authorization';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

function isPaymentType(value: string): value is PaymentType {
  return PAYMENT_TYPES.some((type) => type === value);
}

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method === value);
}

function validatePayment(body: MemberPaymentCreateRequest): string | null {
  if (
    !body ||
    typeof body.amount !== 'number' ||
    typeof body.type !== 'string' ||
    typeof body.method !== 'string' ||
    typeof body.date !== 'string' ||
    typeof body.periodStart !== 'string' ||
    typeof body.periodEnd !== 'string' ||
    typeof body.externalReference !== 'string' ||
    typeof body.notes !== 'string'
  ) {
    return 'Payment details are incomplete or malformed.';
  }
  if (!Number.isFinite(body.amount) || body.amount <= 0 || body.amount > 1_000_000) {
    return 'Enter a valid payment amount.';
  }
  if (!isPaymentType(body.type) || !isPaymentMethod(body.method)) {
    return 'Select a valid payment type and method.';
  }
  if (Number.isNaN(Date.parse(body.date))) {
    return 'Enter a valid payment date.';
  }
  if (body.externalReference.length > 200 || body.notes.length > 2000) {
    return 'The reference or notes are too long.';
  }

  const hasPeriodStart = Boolean(body.periodStart);
  const hasPeriodEnd = Boolean(body.periodEnd);
  if (hasPeriodStart !== hasPeriodEnd) {
    return 'Provide both period dates or leave both blank.';
  }
  if (hasPeriodStart) {
    const start = Date.parse(body.periodStart);
    const end = Date.parse(body.periodEnd);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return 'The payment period is invalid.';
    }
  }
  return null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authorization = await authorizeRequest(request, 'payments.write');
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { memberId } = await context.params;
  if (!Types.ObjectId.isValid(memberId)) {
    return NextResponse.json<MemberPaymentCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  let body: MemberPaymentCreateRequest;
  try {
    body = (await request.json()) as MemberPaymentCreateRequest;
  } catch {
    return NextResponse.json<MemberPaymentCreateResponse>(
      { message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const validationMessage = validatePayment(body);
  if (validationMessage) {
    return NextResponse.json<MemberPaymentCreateResponse>(
      { message: validationMessage },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const memberExists = await Member.exists({ _id: memberId });
  if (!memberExists) {
    return NextResponse.json<MemberPaymentCreateResponse>(
      { message: 'Member not found.' },
      { status: 404 },
    );
  }

  const payment = await Payment.create({
    memberRef: memberId,
    reservationRef: null,
    amount: body.amount,
    entryKind: 'payment',
    type: body.type,
    method: body.method,
    externalReference: body.externalReference.trim(),
    recordedBy: authorization.staff.userId,
    date: new Date(`${body.date}T12:00:00`),
    appliesToPeriod:
      body.periodStart && body.periodEnd
        ? {
            start: new Date(`${body.periodStart}T12:00:00`),
            end: new Date(`${body.periodEnd}T12:00:00`),
          }
        : null,
    notes: body.notes.trim(),
  });

  await logActivity({
    actorId: authorization.staff.userId,
    action: 'create',
    entityType: 'Payment',
    entityId: payment._id,
    afterSnapshot: {
      memberId,
      amount: payment.amount,
      type: payment.type,
      method: payment.method,
      date: payment.date,
    },
  });

  return NextResponse.json<MemberPaymentCreateResponse>(
    { id: payment._id.toString() },
    { status: 201 },
  );
}
