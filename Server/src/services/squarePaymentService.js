import square from "square";
import crypto from "crypto";

const { SquareClient, SquareEnvironment, SquareError } = square;

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.NODE_ENV === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  // version: "2025-08-20", // optional pin
});

export async function chargeDeposit({
  sourceId,
  amount, // cents
  currency = "USD",
  note,
  appFeeMoney, // { amount: cents, currency }
  autocomplete = true,
  customerId,
  referenceId,
}) {
  const idempotencyKey = crypto.randomUUID();
  const amountCents = Math.round(Number(amount)); // cents

  const body = {
    idempotencyKey,
    sourceId,
    locationId: process.env.SQUARE_LOCATION_ID,
    amountMoney: { amount: BigInt(amountCents), currency }, // REQUIRED: BigInt
    autocomplete,
    ...(note && { note }),
    ...(customerId && { customerId }),
    ...(referenceId && { referenceId }),
    ...(appFeeMoney && {
      appFeeMoney: {
        amount: BigInt(Math.round(Number(appFeeMoney.amount))), // BigInt
        currency: appFeeMoney.currency || currency,
      },
    }),
  };

  try {
    const res = await client.payments.create(body);
    return res.payment;
  } catch (err) {
    if (err instanceof SquareError) {
      throw new Error(`Square API error: ${JSON.stringify(err.errors)}`);
    }
    throw err;
  }
}
