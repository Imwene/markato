// Client/src/components/booking/MobileDetails.jsx
import { useMemo, useState } from "react";
import MyPaymentForm from "./PaymentForm";
import { CONFIG } from "../../config/config";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const MobileDetails = ({
  bookingDetails,
  totalPrice,
  mobileDetails,
  setMobileDetails,
  finalizeMobileBooking,
  onBack,
}) => {
  const [local, setLocal] = useState({
    parkingType: mobileDetails.parkingType || "driveway",
    hasWater: !!mobileDetails.hasWater,
    hasPower: !!mobileDetails.hasPower,
    accessNotes: mobileDetails.accessNotes || "",
    arriveContactMethod: mobileDetails.arriveContactMethod || "call",
    depositToken: mobileDetails.depositToken || null,
  });

  const depositAmount = useMemo(() => {
    const amt = Number(
      (totalPrice * CONFIG.MOBILE_SERVICE.DEPOSIT_PERCENTAGE).toFixed(2)
    );
    return Math.max(0, amt);
  }, [totalPrice]);

  const onTokenize = ({ token }) => {
    const tokenValue = token?.token || token?.id || null;
    setLocal((prev) => ({
      ...prev,
      depositToken: tokenValue,
    }));

    // Auto-finalize immediately after tokenization
    finalizeMobileBooking({
      depositToken: tokenValue,
      fields: {
        parkingType: local.parkingType,
        hasWater: local.hasWater,
        hasPower: local.hasPower,
        accessNotes: local.accessNotes,
        arriveContactMethod: local.arriveContactMethod,
      },
      // Include customer details to ensure they're in the final booking
      customerDetails: {
        name: bookingDetails.name,
        email: bookingDetails.email,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold text-content-dark dark:text-white">
        Mobile Details & Deposit
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Parking</label>
          <select
            value={local.parkingType}
            onChange={(e) =>
              setLocal((p) => ({ ...p, parkingType: e.target.value }))
            }
            className="w-full p-3 rounded-lg border bg-background-light dark:bg-stone-800 border-border-DEFAULT dark:border-stone-700"
          >
            <option value="driveway">Driveway</option>
            <option value="street">Street</option>
            <option value="garage">Garage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Arrival Contact
          </label>
          <select
            value={local.arriveContactMethod}
            onChange={(e) =>
              setLocal((p) => ({ ...p, arriveContactMethod: e.target.value }))
            }
            className="w-full p-3 rounded-lg border bg-background-light dark:bg-stone-800 border-border-DEFAULT dark:border-stone-700"
          >
            <option value="call">Call</option>
            <option value="text">Text</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={local.hasWater}
            onChange={(e) =>
              setLocal((p) => ({ ...p, hasWater: e.target.checked }))
            }
            className="rounded border-border-DEFAULT"
          />
          Onsite Water Available
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={local.hasPower}
            onChange={(e) =>
              setLocal((p) => ({ ...p, hasPower: e.target.checked }))
            }
            className="rounded border-border-DEFAULT"
          />
          Onsite Power Available
        </label>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Access Notes (gate code, special instructions)
          </label>
          <textarea
            rows={3}
            value={local.accessNotes}
            onChange={(e) =>
              setLocal((p) => ({ ...p, accessNotes: e.target.value }))
            }
            className="w-full p-3 rounded-lg border bg-background-light dark:bg-stone-800 border-border-DEFAULT dark:border-stone-700"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg border border-border-light dark:border-stone-700 bg-background-light dark:bg-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-content-light dark:text-stone-400">
              Deposit (50%)
            </p>
            <p className="text-2xl font-bold text-content-dark dark:text-white">
              ${depositAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-content-light dark:text-stone-400">
              Name
            </p>
            <p className="font-medium text-content-dark dark:text-white">
              {bookingDetails.name || "—"}
            </p>
            <p className="text-sm text-content-light dark:text-stone-400 mt-1">
              Email
            </p>
            <p className="font-medium text-content-dark dark:text-white">
              {bookingDetails.email || "—"}
            </p>
          </div>
        </div>

        <MyPaymentForm
          amount={depositAmount.toFixed(2)}
          currencyCode="USD"
          onTokenize={onTokenize}
          billingContact={{
            familyName: "",
            givenName: bookingDetails.name || "",
            email: bookingDetails.email || "",
            countryCode: "US",
          }}
        />
      </div>

      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          className="flex-1 p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back to Details
        </motion.button>
      </div>
    </div>
  );
};

MobileDetails.propTypes = {
  bookingDetails: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  totalPrice: PropTypes.number.isRequired,
  mobileDetails: PropTypes.shape({
    parkingType: PropTypes.string,
    hasWater: PropTypes.bool,
    hasPower: PropTypes.bool,
    accessNotes: PropTypes.string,
    arriveContactMethod: PropTypes.string,
    depositToken: PropTypes.string,
  }).isRequired,
  setMobileDetails: PropTypes.func.isRequired,
  finalizeMobileBooking: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default MobileDetails;
// ... end of file ...
