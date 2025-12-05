import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Plus, Edit2, Save, X, ArrowUp, ArrowDown, AlertTriangle, Clock, Trash2 } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config.js";

// Confirmation Dialog Component for mobile detailing toggle
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, isEnabling, isSaving, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - don't allow closing while saving */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isSaving ? undefined : onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-stone-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-border-light dark:border-stone-700">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-2 rounded-full ${
            isEnabling 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-amber-100 dark:bg-amber-900/30"
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              isEnabling 
                ? "text-green-600 dark:text-green-400" 
                : "text-amber-600 dark:text-amber-400"
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-content-dark dark:text-white mb-2">
              {isEnabling ? "Enable Mobile Detailing?" : "Disable Mobile Detailing?"}
            </h3>
            <p className="text-sm text-content-light dark:text-stone-400 mb-4">
              {isEnabling 
                ? "Customers will be able to book mobile detailing services at their location. This includes address validation, service area checks, and payment processing."
                : "Customers will only be able to book drive-in services. The mobile detailing option will be hidden from the booking flow. Any bookings currently in progress will still be completed."
              }
            </p>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-content-DEFAULT dark:text-stone-300 
                         bg-stone-100 dark:bg-stone-700 rounded-lg 
                         hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors 
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isEnabling
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
                }`}
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSaving ? "Saving..." : (isEnabling ? "Enable" : "Disable")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfigurationManager = () => {
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vehicleTypes");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [scents, setScents] = useState([]);
  const [optionalServices, setOptionalServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  // Default business hours - matches server defaults
  const DEFAULT_BUSINESS_HOURS = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  const [businessSettings, setBusinessSettings] = useState({
    unavailableDay: null,
    mobileDetailingEnabled: false,
    businessHours: DEFAULT_BUSINESS_HOURS,
  });
  const [showMobileToggleConfirm, setShowMobileToggleConfirm] = useState(false);
  const [pendingMobileToggleValue, setPendingMobileToggleValue] = useState(false);
  const [mobileToggleSaving, setMobileToggleSaving] = useState(false);
  const [mobileToggleError, setMobileToggleError] = useState(null);
  
  // Business hours editing state
  const [businessHoursEditing, setBusinessHoursEditing] = useState(false);
  const [editedBusinessHours, setEditedBusinessHours] = useState([]);
  const [businessHoursSaving, setBusinessHoursSaving] = useState(false);
  const [businessHoursError, setBusinessHoursError] = useState(null);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const createNewItem = (type) => {
    switch (type) {
      case "vehicle-types":
        return {
          // Vehicle types use string IDs, so we'll handle this differently
          id: "",
          label: "",
          isActive: true,
          sortOrder: 0,
        };
      case "scents":
        // For scents, auto-increment numeric ID
        const nextScentId =
          scents.length > 0
            ? Math.max(...scents.map((scent) => scent.id)) + 1
            : 1;
        return {
          id: nextScentId,
          name: "",
          isActive: true,
          sortOrder: 0,
        };
      case "optional-services":
        // For optional services, auto-increment numeric ID
        const nextServiceId =
          optionalServices.length > 0
            ? Math.max(...optionalServices.map((service) => service.id)) + 1
            : 1;
        return {
          id: nextServiceId,
          name: "",
          description: "",
          price: 0,
          isActive: true,
          sortOrder: 0,
        };
      default:
        return {};
    }
  };

  const handleAddItem = (type) => {
    const newItem = createNewItem(type);
    setEditingId("new"); // Use 'new' to indicate a new item
    setEditForm(newItem);
  };

  const fetchConfigurations = async () => {
    try {
      setLoading(true);

      const [
        vehicleTypesData,
        scentsData,
        optionalServicesData,
        businessSettingsData,
      ] = await Promise.all([
        api.get(CONFIG.ENDPOINTS.CONFIG.VEHICLE_TYPES),
        api.get(CONFIG.ENDPOINTS.CONFIG.SCENTS),
        api.get(CONFIG.ENDPOINTS.CONFIG.OPTIONAL_SERVICES),
        api.get(CONFIG.ENDPOINTS.CONFIG.BUSINESS_SETTINGS, { public: true }),
      ]);

      setVehicleTypes(vehicleTypesData.data);
      setScents(scentsData.data);
      setOptionalServices(optionalServicesData.data);
      setBusinessSettings(businessSettingsData.data);
    } catch (error) {
      console.error("Error fetching configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update handleSave to use api utility
  const handleSave = async (type) => {
    try {
      let response;
      let payload = { ...editForm };

      // Handle ID conversions based on type
      if (type === "vehicle-types") {
        // Vehicle types use string IDs, validate it's not empty
        if (!payload.id.trim()) {
          setError("Vehicle type ID cannot be empty");
          return;
        }
      } else {
        // Scents and optional services use numeric IDs
        payload.id = parseInt(payload.id);
        if (isNaN(payload.id) || payload.id < 1) {
          setError("ID must be a positive number");
          return;
        }

        // Add price conversion for optional services
        if (type === "optional-services") {
          payload.price = parseFloat(payload.price);
        }
      }

      if (editingId === "new") {
        response = await api.post(CONFIG.ENDPOINTS.CONFIG.BASE(type), payload);
      } else {
        response = await api.put(
          CONFIG.ENDPOINTS.CONFIG.BY_ID(type, editingId),
          payload
        );
      }

      if (response.success) {
        await fetchConfigurations();
        setEditingId(null);
        setEditForm({});
        setError(null);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      setError(error.message);
    }
  };

  // Update handleSort to use api utility
  const handleSort = async (type, id, direction) => {
    try {
      const items =
        type === "vehicle-types"
          ? vehicleTypes
          : type === "scents"
          ? scents
          : optionalServices;

      const currentIndex = items.findIndex((item) => item._id === id);
      const newOrder =
        direction === "up"
          ? items[currentIndex].sortOrder - 1
          : items[currentIndex].sortOrder + 1;

      // Use the CONFIG.ENDPOINTS.CONFIG.BY_ID helper method
      await api.put(CONFIG.ENDPOINTS.CONFIG.BY_ID(type, id), {
        sortOrder: newOrder,
      });

      await fetchConfigurations();
    } catch (error) {
      console.error("Error updating sort order:", error);
    }
  };
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 
                        border-primary-light dark:border-orange-500"
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border-light">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("vehicleTypes")}
            className={`px-1 py-4 border-b-2 text-sm font-medium ${
              activeTab === "vehicleTypes"
                ? "border-primary-light text-primary-light dark:border-orange-500 dark:text-orange-500"
                : "border-transparent text-content-light hover:text-content-DEFAULT hover:border-border-DEFAULT dark:text-stone-400 dark:hover:text-stone-200 dark:hover:border-stone-700"
            }`}
          >
            Vehicle Types
          </button>
          <button
            onClick={() => setActiveTab("scents")}
            className={`px-1 py-4 border-b-2 text-sm font-medium ${
              activeTab === "scents"
                ? "border-primary-light text-primary-light dark:border-orange-500 dark:text-orange-500"
                : "border-transparent text-content-light hover:text-content-DEFAULT hover:border-border-DEFAULT dark:text-stone-400 dark:hover:text-stone-200 dark:hover:border-stone-700"
            }`}
          >
            Scents
          </button>
          <button
            onClick={() => setActiveTab("optionalServices")}
            className={`px-1 py-4 border-b-2 text-sm font-medium ${
              activeTab === "optionalServices"
                ? "border-primary-light text-primary-light dark:border-orange-500 dark:text-orange-500"
                : "border-transparent text-content-light hover:text-content-DEFAULT hover:border-border-DEFAULT dark:text-stone-400 dark:hover:text-stone-200 dark:hover:border-stone-700"
            }`}
          >
            Optional Services
          </button>
          <button
            onClick={() => setActiveTab("businessSettings")}
            className={`px-1 py-4 border-b-2 text-sm font-medium ${
              activeTab === "businessSettings"
                ? "border-primary-light text-primary-light dark:border-orange-500 dark:text-orange-500"
                : "border-transparent text-content-light hover:text-content-DEFAULT hover:border-border-DEFAULT dark:text-stone-400 dark:hover:text-stone-200 dark:hover:border-stone-700"
            }`}
          >
            Business Settings
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "vehicleTypes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">
                Vehicle Types
              </h3>
              <button
                onClick={() => handleAddItem("vehicle-types")}
                className="flex items-center gap-2 px-4 py-2 text-sm 
                bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle Type
              </button>
            </div>
            <div
              className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sort</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingId === "new" && (
                    <TableRow>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.id || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, id: e.target.value })
                          }
                          placeholder="Enter ID (e.g., sedan, suv)"
                          className="lowercase"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.label || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, label: e.target.value })
                          }
                          placeholder="Enter Label"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isActive: e.target.value === "true",
                            })
                          }
                          className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave("vehicle-types")}
                            className="p-1 text-green-600 dark:text-green-400 
                          hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            className="p-1 text-red-600 dark:text-red-400 
                          hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {vehicleTypes.map((type) => (
                    <TableRow key={type._id}>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleSort("vehicle-types", type._id, "up")
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleSort("vehicle-types", type._id, "down")
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingId === type._id ? (
                          <Input
                            value={editForm.id || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, id: e.target.value })
                            }
                          />
                        ) : (
                          type.id
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === type._id ? (
                          <Input
                            value={editForm.label || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                label: e.target.value,
                              })
                            }
                          />
                        ) : (
                          type.label
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === type._id ? (
                          <select
                            value={editForm.isActive}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.value === "true",
                              })
                            }
                            className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              type.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {type.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === type._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave("vehicle-types")}
                              className="p-1 text-green-600 dark:text-green-400 
                            hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-red-600 dark:text-red-400 
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6">
        {activeTab === "scents" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">
                Scents
              </h3>
              <button
                onClick={() => handleAddItem("scents")}
                className="flex items-center gap-2 px-4 py-2 text-sm 
                bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Scent
              </button>
            </div>
            <div
              className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sort</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingId === "new" && (
                    <TableRow>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.id || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, id: e.target.value })
                          }
                          placeholder="ID will be auto-assigned"
                          min="1"
                          step="1"
                          required
                          disabled={editingId === "new"} // Disable editing for new items since it's auto-assigned
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Enter Name"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isActive: e.target.value === "true",
                            })
                          }
                          className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave("scents")}
                            className="p-1 text-green-600 dark:text-green-400 
                          hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            className="p-1 text-red-600 dark:text-red-400 
                          hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {scents.map((scent) => (
                    <TableRow key={scent._id}>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleSort("scents", scent._id, "up")
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleSort("scents", scent._id, "down")
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingId === scent._id ? (
                          <Input
                            type="number"
                            value={editForm.id || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                id: parseInt(e.target.value),
                              })
                            }
                          />
                        ) : (
                          scent.id
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === scent._id ? (
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          scent.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === scent._id ? (
                          <select
                            value={editForm.isActive}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.value === "true",
                              })
                            }
                            className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              scent.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {scent.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === scent._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave("scents")}
                              className="p-1 text-green-600 dark:text-green-400 
                            hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-red-600 dark:text-red-400 
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(scent)}
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {activeTab === "optionalServices" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">
                Optional Services
              </h3>
              <button
                onClick={() => handleAddItem("optional-services")}
                className="flex items-center gap-2 px-4 py-2 text-sm 
                bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Optional Service
              </button>
            </div>
            <div
              className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sort</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingId === "new" && (
                    <TableRow>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.id || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, id: e.target.value })
                          }
                          placeholder="ID will be auto-assigned"
                          min="1"
                          step="1"
                          required
                          disabled={editingId === "new"} // Disable editing for new items since it's auto-assigned
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Enter Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={editForm.description || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter Description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.price || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          placeholder="Enter Price"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isActive: e.target.value === "true",
                            })
                          }
                          className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave("optional-services")}
                            className="p-1 text-green-600 dark:text-green-400 
                          hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({});
                            }}
                            className="p-1 text-red-600 dark:text-red-400 
                          hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {optionalServices.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleSort("optional-services", service._id, "up")
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleSort(
                                "optional-services",
                                service._id,
                                "down"
                              )
                            }
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <Input
                            type="number"
                            value={editForm.id || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                id: parseInt(e.target.value),
                              })
                            }
                          />
                        ) : (
                          service.id
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          service.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <Input
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                          />
                        ) : (
                          service.description
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <Input
                            type="number"
                            value={editForm.price || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                price: parseFloat(e.target.value),
                              })
                            }
                          />
                        ) : (
                          `$${service.price}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <select
                            value={editForm.isActive}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.value === "true",
                              })
                            }
                            className="p-2 border rounded-md 
             bg-background-light dark:bg-stone-800
             border-border-DEFAULT dark:border-stone-700
             text-content-DEFAULT dark:text-white"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              service.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === service._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave("optional-services")}
                              className="p-1 text-green-600 dark:text-green-400 
                            hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-red-600 dark:text-red-400 
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {activeTab === "businessSettings" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-content-dark dark:text-white">
              Business Settings
            </h3>
            
            {/* Mobile Detailing Toggle */}
            <div className="w-full bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-content-dark dark:text-stone-200">
                    Mobile Detailing Service
                  </label>
                  <p className="text-xs text-content-light dark:text-stone-400 mt-1">
                    Allow customers to book mobile detailing services at their location. 
                    When disabled, only drive-in bookings are available.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    businessSettings?.mobileDetailingEnabled
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                  }`}>
                    {businessSettings?.mobileDetailingEnabled ? "Enabled" : "Disabled"}
                  </span>
                  {/* Toggle Switch */}
                  <button
                    onClick={() => {
                      setPendingMobileToggleValue(!businessSettings?.mobileDetailingEnabled);
                      setShowMobileToggleConfirm(true);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500 focus:ring-offset-2 ${
                      businessSettings?.mobileDetailingEnabled
                        ? "bg-green-600 dark:bg-green-600"
                        : "bg-stone-300 dark:bg-stone-600"
                    }`}
                    role="switch"
                    aria-checked={businessSettings?.mobileDetailingEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        businessSettings?.mobileDetailingEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Unavailable Day Setting */}
            <div className="w-full bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700 p-4">
              <label className="block mb-2 text-sm font-medium text-content-dark dark:text-stone-200">
                Unavailable Day (Closed)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={businessSettings?.unavailableDay ?? ""}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      unavailableDay:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                  className="p-2 border rounded-md bg-background-light dark:bg-stone-800 border-border-DEFAULT dark:border-stone-700 text-content-DEFAULT dark:text-white"
                >
                  <option value="">None</option>
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
                <button
                  onClick={async () => {
                    try {
                      await api.put(
                        CONFIG.ENDPOINTS.CONFIG.BUSINESS_SETTINGS,
                        { unavailableDay: businessSettings?.unavailableDay },
                        {}
                      );
                      await fetchConfigurations();
                    } catch (err) {
                      console.error("Failed to update business settings", err);
                    }
                  }}
                  className="px-4 py-2 text-sm bg-primary-light dark:bg-orange-500 text-white rounded-lg hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-content-light dark:text-stone-400">
                When set, customers won't be able to select this day in the
                booking form.
              </p>
            </div>

            {/* Business Hours Configuration */}
            <div className="w-full bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-light dark:text-orange-500" />
                  <label className="text-sm font-medium text-content-dark dark:text-stone-200">
                    Available Booking Times
                  </label>
                </div>
                {!businessHoursEditing ? (
                  <button
                    onClick={() => {
                      setEditedBusinessHours([...(businessSettings?.businessHours || DEFAULT_BUSINESS_HOURS)]);
                      setBusinessHoursEditing(true);
                      setBusinessHoursError(null);
                    }}
                    className="px-3 py-1.5 text-sm bg-stone-100 dark:bg-stone-700 text-content-DEFAULT dark:text-stone-300 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBusinessHoursEditing(false);
                        setEditedBusinessHours([]);
                        setBusinessHoursError(null);
                        setNewTimeSlot("");
                      }}
                      disabled={businessHoursSaving}
                      className="px-3 py-1.5 text-sm bg-stone-100 dark:bg-stone-700 text-content-DEFAULT dark:text-stone-300 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editedBusinessHours.length === 0) {
                          setBusinessHoursError("At least one time slot is required");
                          return;
                        }
                        setBusinessHoursSaving(true);
                        setBusinessHoursError(null);
                        try {
                          await api.put(
                            CONFIG.ENDPOINTS.CONFIG.BUSINESS_SETTINGS,
                            { businessHours: editedBusinessHours },
                            {}
                          );
                          await fetchConfigurations();
                          setBusinessHoursEditing(false);
                          setEditedBusinessHours([]);
                          setNewTimeSlot("");
                        } catch (err) {
                          console.error("Failed to update business hours", err);
                          setBusinessHoursError(err.message || "Failed to save. Please try again.");
                        } finally {
                          setBusinessHoursSaving(false);
                        }
                      }}
                      disabled={businessHoursSaving || editedBusinessHours.length === 0}
                      className="px-3 py-1.5 text-sm bg-primary-light dark:bg-orange-500 text-white rounded-lg hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {businessHoursSaving && (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {businessHoursSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-content-light dark:text-stone-400 mb-3">
                Configure the time slots available for customer bookings. Adjust these seasonally as needed.
              </p>

              {businessHoursError && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{businessHoursError}</p>
                </div>
              )}

              {!businessHoursEditing ? (
                /* Display mode - show current business hours */
                <div className="flex flex-wrap gap-2">
                  {(businessSettings?.businessHours || DEFAULT_BUSINESS_HOURS).map((time, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-content-DEFAULT dark:text-stone-300 rounded-lg text-sm"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              ) : (
                /* Edit mode - allow adding/removing time slots */
                <div className="space-y-3">
                  {/* Current time slots */}
                  <div className="flex flex-wrap gap-2">
                    {editedBusinessHours.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-content-DEFAULT dark:text-stone-300 rounded-lg text-sm group"
                      >
                        <span>{time}</span>
                        <button
                          onClick={() => {
                            setEditedBusinessHours(editedBusinessHours.filter((_, i) => i !== index));
                          }}
                          className="ml-1 p-0.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Remove time slot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new time slot */}
                  <div className="flex items-center gap-2">
                    <select
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="p-2 border rounded-md bg-background-light dark:bg-stone-800 border-border-DEFAULT dark:border-stone-700 text-content-DEFAULT dark:text-white text-sm"
                    >
                      <option value="">Select time to add...</option>
                      {/* Generate all possible time slots */}
                      {[
                        "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM",
                        "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
                        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
                        "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
                        "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
                        "9:00 PM"
                      ]
                        .filter((time) => !editedBusinessHours.includes(time))
                        .map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        if (newTimeSlot && !editedBusinessHours.includes(newTimeSlot)) {
                          // Robust time parsing - handles various formats
                          const timeToMinutes = (timeStr) => {
                            // Split on whitespace (handles multiple spaces or tabs)
                            const parts = timeStr.trim().split(/\s+/);
                            const time = parts[0] || "";
                            const periodRaw = parts[1] || "";
                            const period = periodRaw.toUpperCase();
                            
                            const timeParts = time.split(":");
                            let hours = parseInt(timeParts[0], 10) || 0;
                            const minutes = parseInt(timeParts[1], 10) || 0;
                            
                            // Handle invalid/missing period gracefully
                            if (period === "PM" && hours !== 12) hours += 12;
                            if (period === "AM" && hours === 12) hours = 0;
                            
                            // Return large number for invalid times to sort them to the end
                            if (isNaN(hours) || isNaN(minutes)) return Number.MAX_SAFE_INTEGER;
                            
                            return hours * 60 + minutes;
                          };
                          const newHours = [...editedBusinessHours, newTimeSlot].sort(
                            (a, b) => timeToMinutes(a) - timeToMinutes(b)
                          );
                          setEditedBusinessHours(newHours);
                          setNewTimeSlot("");
                        }
                      }}
                      disabled={!newTimeSlot}
                      className="px-3 py-2 text-sm bg-stone-200 dark:bg-stone-600 text-content-DEFAULT dark:text-white rounded-lg hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2 pt-2 border-t border-border-light dark:border-stone-700">
                    <button
                      onClick={() => setEditedBusinessHours([...DEFAULT_BUSINESS_HOURS])}
                      className="text-xs text-primary-light dark:text-orange-400 hover:underline"
                    >
                      Reset to defaults
                    </button>
                    <span className="text-stone-300 dark:text-stone-600">|</span>
                    <button
                      onClick={() => setEditedBusinessHours([])}
                      className="text-xs text-red-500 dark:text-red-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Detailing Toggle Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showMobileToggleConfirm}
        onClose={() => {
          if (!mobileToggleSaving) {
            setShowMobileToggleConfirm(false);
            setMobileToggleError(null);
          }
        }}
        isEnabling={pendingMobileToggleValue}
        isSaving={mobileToggleSaving}
        error={mobileToggleError}
        onConfirm={async () => {
          setMobileToggleSaving(true);
          setMobileToggleError(null);
          try {
            await api.put(
              CONFIG.ENDPOINTS.CONFIG.BUSINESS_SETTINGS,
              { mobileDetailingEnabled: pendingMobileToggleValue },
              {}
            );
            await fetchConfigurations();
            setShowMobileToggleConfirm(false);
            setMobileToggleError(null);
          } catch (err) {
            console.error("Failed to update mobile detailing setting", err);
            setMobileToggleError(
              err.message || "Failed to update setting. Please try again."
            );
          } finally {
            setMobileToggleSaving(false);
          }
        }}
      />
    </div>
  );
};

export default ConfigurationManager;
