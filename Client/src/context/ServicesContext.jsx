import { createContext, useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../config/config';

export const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const fetchServices = useCallback(async (serviceType = null) => {
        try {
            setLoading(true);
            const url = serviceType 
                ? `${CONFIG.API_URL}${CONFIG.ENDPOINTS.SERVICES.BASE}?serviceType=${serviceType}`
                : `${CONFIG.API_URL}${CONFIG.ENDPOINTS.SERVICES.BASE}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setServices(data.data);
                setError(null);
            } else {
                setError('Failed to fetch services');
            }
        } catch (error) {
            setError('Error connecting to the server');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServicesByType = useCallback(async (serviceType) => {
        await fetchServices(serviceType);
    }, [fetchServices]);

    useEffect(() => {
        fetchServices();
    }, []);

    const value = {
        services,
        loading,
        error,
        refreshServices: fetchServices,
        fetchServicesByType,
        isModalOpen,
        editingService,
        openModal: (service = null) => {
            setEditingService(service);
            setIsModalOpen(true);
        },
        closeModal: () => {
            setIsModalOpen(false);
            setEditingService(null);
        }
    };

    return (
        <ServicesContext.Provider value={value}>
            {children}
        </ServicesContext.Provider>
    );
};