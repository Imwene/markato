import { createContext, useState, useEffect } from 'react';

export const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
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
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const value = {
        services,
        loading,
        error,
        refreshServices: fetchServices,
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