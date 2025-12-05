// Dependencies
import {
  CreditCard,
  PaymentForm,
  ApplePay,
  GooglePay,
} from "react-square-web-payments-sdk";
import PropTypes from "prop-types";
import { CONFIG } from "../../config/config";

const MyPaymentForm = ({
  amount = "1.00",
  currencyCode = "USD",
  countryCode = "US",
  label = "Deposit",
  onTokenize,
  billingContact,
  applicationId,
  locationId,
}) => {
  const appId = applicationId || CONFIG.SQUARE?.APP_ID;
  const locId = locationId || CONFIG.SQUARE?.LOCATION_ID;
  
  // Error handling for missing credentials
  if (!appId || !locId) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-700 dark:text-red-400 text-sm">
          ⚠️ Payment configuration error: Square credentials are missing.
          {!appId && ' Missing APP_ID.'}
          {!locId && ' Missing LOCATION_ID.'}
        </p>
        <p className="text-red-600 dark:text-red-500 text-xs mt-2">
          Please contact support to complete your booking.
        </p>
      </div>
    );
  }

  const createPaymentRequest = () => ({
    countryCode,
    currencyCode,
    total: { amount: String(amount), label },
  });

  return (
    <PaymentForm
      applicationId={appId}
      locationId={locId}
      cardTokenizeResponseReceived={(token, buyer) => {
        try {
          onTokenize?.({ token, buyer });
        } catch (e) {
          console.error("onTokenize handler error:", e);
        }
      }}
      createPaymentRequest={createPaymentRequest}
      createVerificationDetails={() => ({
        amount: String(amount),
        billingContact: billingContact || {},
        currencyCode,
        intent: "CHARGE",
      })}
    >
      <ApplePay />
      <GooglePay />
      <CreditCard />
    </PaymentForm>
  );
};

MyPaymentForm.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currencyCode: PropTypes.string,
  countryCode: PropTypes.string,
  label: PropTypes.string,
  onTokenize: PropTypes.func,
  billingContact: PropTypes.object,
  applicationId: PropTypes.string,
  locationId: PropTypes.string,
};

export default MyPaymentForm;
