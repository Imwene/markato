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
import { Plus, Edit2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config.js";


const ConfigurationManager = () => {
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vehicleTypes");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [scents, setScents] = useState([]);
  const [optionalServices, setOptionalServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

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
        const nextScentId = scents.length > 0
          ? Math.max(...scents.map(scent => scent.id)) + 1
          : 1;
        return {
          id: nextScentId,
          name: "",
          isActive: true,
          sortOrder: 0,
        };
      case "optional-services":
        // For optional services, auto-increment numeric ID
        const nextServiceId = optionalServices.length > 0
          ? Math.max(...optionalServices.map(service => service.id)) + 1
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
      
      const [vehicleTypesData, scentsData, optionalServicesData] =
        await Promise.all([
          api.get(CONFIG.ENDPOINTS.CONFIG.VEHICLE_TYPES),
          api.get(CONFIG.ENDPOINTS.CONFIG.SCENTS),
          api.get(CONFIG.ENDPOINTS.CONFIG.OPTIONAL_SERVICES),
        ]);

      setVehicleTypes(vehicleTypesData.data);
      setScents(scentsData.data);
      setOptionalServices(optionalServicesData.data);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 
                        border-primary-light dark:border-orange-500">
        </div>
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
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "vehicleTypes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">Vehicle Types</h3>
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
            <div className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0">
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
                            setEditForm({ ...editForm, label: e.target.value })
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
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">Scents</h3>
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
            <div className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0">
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
                          onClick={() => handleSort("scents", scent._id, "up")}
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
              <h3 className="text-lg font-semibold text-content-dark dark:text-white">Optional Services</h3>
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
            <div className="w-full overflow-x-auto 
                bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700 
                relative z-0">
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
                            handleSort("optional-services", service._id, "down")
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
    </div>
  );
};

export default ConfigurationManager;