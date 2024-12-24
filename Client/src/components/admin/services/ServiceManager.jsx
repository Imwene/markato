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

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8080/api/services");
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setError(data.error || "Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("Failed to connect to the server");
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
    if (window.confirm("Are you sure you want to mark this service as inactive?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/services/${serviceId}`,
          {
            method: "DELETE", // This should call the backend method to set isActive to false
          }
        );
        const data = await response.json();
        if (data.success) {
          // Instead of filtering, update the service's active status
          setServices(services.map(s => 
            s._id === serviceId 
              ? { ...s, isActive: false } 
              : s
          ));
        }
      } catch (error) {
        console.error("Error updating service status:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-dark">Service Management</h1>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg 
                   hover:bg-primary-DEFAULT transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="w-full overflow-x-auto bg-background-light rounded-lg border border-border-light relative z-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell className="font-medium text-content-DEFAULT">
                  {service.name}
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-content-light">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {Object.entries(service.vehiclePricing).map(
                      ([vehicle, price]) => (
                        <div key={vehicle} className="text-sm">
                          <span className="text-content-light capitalize">{vehicle}: </span>
                          <span className="text-primary-DEFAULT">${price}</span>
                        </div>
                      )
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 hover:bg-background-dark rounded-lg transition-colors text-content-light"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-2 hover:bg-background-dark rounded-lg transition-colors text-red-500"
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
              // Update existing service
              setServices(
                services.map((s) =>
                  s._id === updatedService._id ? updatedService : s
                )
              );
            } else {
              // Add new service
              setServices([...services, updatedService]);
            }
            setIsModalOpen(false);
            setEditingService(null);
            //fetchServices(); // Refresh the list
          }}
        />
      )}
    </div>
  );
};

export default ServiceManager;