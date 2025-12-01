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
    // Use paymentsApi if available (newer SDKs), fallback to payments (older SDKs)
    const paymentsApi = client.paymentsApi || client.payments;

    if (!paymentsApi) {
      throw new Error("Square Payments API not found on client object");
    }

    const res = await paymentsApi.create(body);

    // Handle different response structures
    const payment = res.result
      ? res.result.payment
      : res.payment || res.body?.payment;

    if (!payment) {
      console.error(
        "Square API Response:",
        JSON.stringify(
          res,
          (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2
        )
      );
      throw new Error("Payment created but no payment object returned");
    }

    return payment;
  } catch (err) {
    console.error("Square Payment Error:", err);
    if (err instanceof SquareError) {
      throw new Error(`Square API error: ${JSON.stringify(err.errors)}`);
    }
    // Handle JSON stringified errors if they come in that format
    if (err.result && err.result.errors) {
      throw new Error(`Square API error: ${JSON.stringify(err.result.errors)}`);
    }
    throw err;
  }
}
