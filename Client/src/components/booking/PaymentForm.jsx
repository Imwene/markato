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
  const appId = applicationId || CONFIG.SQUARE.APP_ID;
  const locId = locationId || CONFIG.SQUARE.LOCATION_ID;

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
