import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Plus } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";

const OptionalServices = ({
  selectedOptions,
  onOptionSelect,
  onContinue,
  onBack,
  optionQuantities,
  onQuantityChange,
}) => {
  const { optionalServices, loading } = useConfig();

  const isSeatShampoo = (service) =>
    service?.name?.toLowerCase?.() === "seat cloth shampoo";

  const handleServiceToggle = (service) => {
    const optionId = service.id.toString();
    const isSelected = selectedOptions.includes(optionId);

    if (isSelected) {
      onOptionSelect(selectedOptions.filter((id) => id !== optionId));
    } else {
      onOptionSelect([...selectedOptions, optionId]);
      if (
        isSeatShampoo(service) &&
        (!optionQuantities || !optionQuantities[optionId])
      ) {
        onQuantityChange?.(optionId, 1);
      }
    }
  };

  const clampQty = (q) => Math.max(1, Math.min(4, Number(q) || 1));

  const calculateTotal = () => {
    const total = optionalServices
      .filter((service) => selectedOptions.includes(service.id.toString()))
      .reduce((sum, service) => {
        const base = parseFloat(service.price);
        if (isSeatShampoo(service)) {
          const q = clampQty(optionQuantities?.[service.id.toString()] || 1);
          return sum + base * q;
        }
        return sum + base;
      }, 0);
    return total.toFixed(2);
  };

  if (loading) {
    return <div>Loading optional services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {optionalServices.map((service) => {
          const idStr = service.id.toString();
          const selected = selectedOptions.includes(idStr);
          const qty = clampQty(optionQuantities?.[idStr] || 1);
          const perSeat = parseFloat(service.price);
          const displayPrice =
            isSeatShampoo(service) && selected
              ? (perSeat * qty).toFixed(2)
              : service.price;

          return (
            <motion.div
              key={service.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200
              ${
                selected
                  ? "bg-primary-light/5 dark:bg-orange-500/10 border-primary-light dark:border-orange-500"
                  : "bg-white dark:bg-stone-800 border-primary-light/50 dark:border-orange-500/20 hover:border-primary-light/80 dark:hover:border-orange-500/40"
              }`}
              onClick={() => handleServiceToggle(service)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <h4 className="text-lg font-medium text-content-dark dark:text-white">
                    {service.name}
                  </h4>
                  <p className="text-sm text-content-light dark:text-stone-400 mt-1">
                    {service.description}
                  </p>

                  {isSeatShampoo(service) && selected && (
                    <div
                      className="mt-2 flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="text-sm text-content-light dark:text-stone-400">
                        Seats (max 4):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange?.(idStr, clampQty(qty - 1))
                          }
                          className="px-2 py-1 rounded border border-primary-light/50 dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700"
                          aria-label="Decrease seats"
                        >
                          -
                        </button>
                        <span className="min-w-[2ch] text-center font-medium">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onQuantityChange?.(idStr, clampQty(qty + 1))
                          }
                          className="px-2 py-1 rounded border border-primary-light/50 dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700"
                          aria-label="Increase seats"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-content-light dark:text-stone-400">
                        ${perSeat} per seat
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-DEFAULT dark:text-orange-500">
                    ${displayPrice}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${
                    selected
                      ? "bg-primary-light dark:bg-orange-500"
                      : "border-2 border-primary-light/50 dark:border-orange-500/20"
                  }`}
                  >
                    {selected ? (
                      <CheckCircle className="w-4 h-4 text-content-dark dark:text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-content-light dark:text-stone-400" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedOptions.length > 0 && (
        <div className="py-3 border-t border-primary-light/30 dark:border-stone-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-content-light dark:text-stone-400">
              Additional Services Total:
            </p>
            <p className="text-xl font-bold text-primary-DEFAULT dark:text-orange-500">
              ${calculateTotal()}
            </p>
          </div>
        </div>
      )}

      <div
        className="sticky bottom-0 left-0 right-0 p-4 
                bg-background-light/95 dark:bg-stone-900/95 
                backdrop-blur-sm border-t border-primary-light/30 dark:border-stone-700"
      >
        <div className="space-y-3">
          <motion.button
            onClick={onContinue}
            className="w-full p-3 rounded-lg bg-primary-light dark:bg-orange-500 
            text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
            transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Booking Details
          </motion.button>
          <motion.button
            onClick={onBack}
            className="w-full p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 
            text-content-DEFAULT dark:text-white 
            border border-primary-light/50 dark:border-stone-700 
            hover:bg-background-dark dark:hover:bg-stone-700 
            transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Services
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OptionalServices;
