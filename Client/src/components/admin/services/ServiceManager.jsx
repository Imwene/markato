// src/components/admin/services/ServiceManager.jsx
import React, { useState, useEffect } from "react";
import ServiceFormModal from "./ServiceFormModal";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import { useConfig } from "../../../hooks/useConfig";

const ServiceManager = () => {
  const { vehicleTypes } = useConfig();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await api.get(CONFIG.ENDPOINTS.SERVICES.BASE);
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = () => {
    setEditingService({
      name: "",
      features: [""],
      vehiclePricing: {
        sedan: 0,
        "mini-suv": 0,
        suv: 0,
        "van/truck": 0,
      },
    });
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (
      window.confirm("Are you sure you want to mark this service as inactive?")
    ) {
      try {
        const data = await api.delete(
          CONFIG.ENDPOINTS.SERVICES.BY_ID(serviceId)
        );
        if (data.success) {
          setServices(
            services.map((s) =>
              s._id === serviceId ? { ...s, isActive: false } : s
            )
          );
        }
      } catch (error) {
        console.error("Error updating service status:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-dark dark:text-white">
          Service Management
        </h1>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-4 py-2 
                   bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                   hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                   transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="w-full overflow-x-auto 
                    bg-background-light dark:bg-stone-800 
                    rounded-lg border border-border-light dark:border-stone-700 
                    relative z-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-content-light dark:text-stone-400">Service Name</TableHead>
              <TableHead className="text-content-light dark:text-stone-400">Features</TableHead>
              <TableHead className="text-content-light dark:text-stone-400">Pricing</TableHead>
              <TableHead className="text-content-light dark:text-stone-400">Status</TableHead>
              <TableHead className="text-right text-content-light dark:text-stone-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell className="font-medium text-content-DEFAULT dark:text-white">
                  {service.name}
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-content-light dark:text-stone-400">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {vehicleTypes.map((vehicleType) => (
                      <div key={vehicleType.id} className="text-sm">
                        <span className="text-content-light dark:text-stone-400 capitalize">
                          {vehicleType.label}:
                        </span>
                        <span className="text-primary-DEFAULT dark:text-orange-500 ml-1">
                          ${service.vehiclePricing[vehicleType.id] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      service.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 
                               rounded-lg transition-colors text-content-light dark:text-stone-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 
                               rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          onSave={(updatedService) => {
            if (editingService?._id) {
              setServices(
                services.map((s) =>
                  s._id === updatedService._id ? updatedService : s
                )
              );
            } else {
              setServices([...services, updatedService]);
            }
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

export default ServiceManager;