import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Search, History, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import { useServices } from "../../../hooks/useServices";
import { useConfig } from "../../../hooks/useConfig";
import { Tooltip } from "../../ui/tooltip";
import StatusHistory from "./StatusHistory";
import DateTimeSelector from "./DateTimeSelector";
const ITEMS_PER_PAGE = 20;

const BookingManager = () => {
  const { services, loading: servicesLoading } = useServices();
  const {
    vehicleTypes,
    optionalServices,
    scents,
    loading: configLoading,
  } = useConfig();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    dateTime: "",
    serviceId: "",
    vehicleType: "",
    makeModel: "",
    email: "",
    contact: "",
    servicePrice: 0,
    selectedScent: "",
    optionalServices: [],
    totalPrice: 0,
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // if (!services || !vehicleTypes || !optionalServices) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
  //     </div>
  //   );
  // }

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  // useEffect(() => {
  //   console.log("Config loaded:", { vehicleTypes, optionalServices });
  // }, [vehicleTypes, optionalServices]);

  useEffect(() => {
    const calculatePrice = async () => {
      if (!editData.serviceId || !editData.vehicleType || !services) {
        // setEditData((prev) => ({
        //   ...prev,
        //   servicePrice: 0,
        //   totalPrice: 0,
        // }));
        return;
      }

      try {
        const service = services.find((s) => s._id === editData.serviceId);
        if (!service || !service.vehiclePricing) return;

        const basePrice = service.vehiclePricing[editData.vehicleType] || 0;
        const optionalServicesTotal = editData.optionalServices.reduce(
          (total, service) => total + (service?.price || 0),
          0
        );

        setEditData((prev) => ({
          ...prev,
          servicePrice: basePrice,
          totalPrice: basePrice + optionalServicesTotal,
        }));
      } catch (error) {
        console.error("Error calculating price:", error);
        setEditErrors((prev) => ({
          ...prev,
          price: "Failed to load service pricing",
        }));
      }
    };
    calculatePrice();
  }, [
    editData.serviceId,
    editData.vehicleType,
    editData.optionalServices,
    services,
  ]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.get(CONFIG.ENDPOINTS.BOOKINGS.BASE);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      if (error.message.includes("token")) {
        window.location.href = "/login";
      }
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (booking) => {
    try {
      setSelectedBooking(booking);

      // Map the booking's optional services to match the format
      const mappedOptionalServices = booking.optionalServices.map(
        (bookingService) => {
          console.log("Mapping service:", bookingService);

          return {
            serviceId: bookingService.serviceId?.toString(), // This should match what's in the config
            name: bookingService.name,
            price: bookingService.price,
            _id: bookingService._id,
          };
        }
      );

      console.log("Mapped optional services:", mappedOptionalServices);

      setEditData({
        ...booking,
        dateTime: booking.dateTime,
        optionalServices: mappedOptionalServices,
        totalPrice: booking.totalPrice,
      });

      setEditErrors({});
      setShowEditModal(true);
    } catch (error) {
      console.error("Error opening edit modal:", error);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      setIsUpdating(true);
      setEditErrors({});

      // Validation
      const validationErrors = validateBookingData(editData);
      if (Object.keys(validationErrors).length > 0) {
        setEditErrors(validationErrors);
        return;
      }

      const response = await api.put(
        `${CONFIG.ENDPOINTS.BOOKINGS.BASE}/${selectedBooking._id}`,
        formatBookingPayload(editData)
      );

      if (response.success) {
        await fetchBookings();
        setShowEditModal(false);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setEditErrors({
        general: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Better loading state
  if (configLoading || servicesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  // Helper functions
  const validateBookingData = (data) => {
    const errors = {};
    if (!data.dateTime) errors.dateTime = "Date & Time is required";
    if (!data.vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!data.makeModel) errors.makeModel = "Make/Model is required";
    if (!data.contact) errors.contact = "Contact is required";
    return errors;
  };

  const formatToLATime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Then use it in your payload formatter
  const formatBookingPayload = (data) => {
    return {
      ...data,
      dateTime: formatToLATime(data.dateTime),
      optionalServices: data.optionalServices.map((service) => ({
        serviceId: Number(service.serviceId),
        name: service.name,
        price: Number(service.price),
      })),
      selectedScent: data.selectedScent || "None",
      
    };
  };

  const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  const handleOptionalServiceToggle = (service) => {
    setEditData((prev) => {
      const serviceId = Number(service.id); // Convert to number for consistency
      const isSelected = prev.optionalServices.some(
        (s) => Number(s.serviceId) === serviceId
      );

      return {
        ...prev,
        optionalServices: isSelected
          ? prev.optionalServices.filter(
              (s) => Number(s.serviceId) !== serviceId
            )
          : [
              ...prev.optionalServices,
              {
                serviceId: Number(service.id), // Store as number
                name: service.name,
                price: Number(service.price),
              },
            ],
      };
    });
  };

  if (configLoading || servicesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  const handleStatusChange = async (bookingId, selectedStatus) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setSelectedBooking(booking);
    setNewStatus(selectedStatus);
    setStatusNote("");
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking || !newStatus || isUpdating) return;

    try {
      setIsUpdating(true); // Set updating state to true when starting

      const response = await api.put(
        CONFIG.ENDPOINTS.BOOKINGS.UPDATE_STATUS(selectedBooking._id),
        {
          status: newStatus,
          note: statusNote,
        }
      );

      if (response.success) {
        await fetchBookings();
        closeStatusModal();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false); // Reset updating state when done
    }
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedBooking(null);
    setNewStatus(null);
    setStatusNote("");
  };

  const getStatusColor = (status = "pending") => {
    const colors = {
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      colors[status.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (booking.contact || "").includes(searchTerm) ||
      (booking.confirmationNumber || "").includes(searchTerm);

    if (filter === "all") return matchesSearch;
    return matchesSearch && booking.status === filter;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const renderMobileCard = (booking) => (
    <div
      key={booking._id}
      className="p-4 bg-background-DEFAULT dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700 mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-primary-DEFAULT dark:text-orange-500">
          {booking.confirmationNumber}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(booking)}
            className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
            title="Edit Booking"
          >
            <Edit className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
          </button>
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowHistoryModal(true);
            }}
            className="p-1 text-primary-DEFAULT dark:text-orange-500"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-content-DEFAULT dark:text-white">
          {booking.dateTime}
        </p>
        <p className="font-medium text-content-DEFAULT dark:text-white">
          {booking.name}
        </p>
        <p className="text-sm text-content-light dark:text-stone-400">
          {booking.contact}
        </p>
        {booking.email && (
          <p className="text-sm text-content-light dark:text-stone-400">
            {booking.email}
          </p>
        )}
        <p className="font-medium text-content-DEFAULT dark:text-white">
          {booking.serviceName}
        </p>
        <p className="text-sm text-content-light dark:text-stone-400">
          {booking.vehicleType} - {booking.makeModel}
        </p>

        {booking.optionalServices?.length > 0 && (
          <Tooltip
            content={
              <div className="space-y-2 bg-background-DEFAULT dark:bg-stone-700 p-2 rounded-md">
                <p className="font-medium text-content-DEFAULT dark:text-white">
                  Optional Services:
                </p>
                <ul>
                  {booking.optionalServices.map((service) => (
                    <li
                      key={service._id}
                      className="text-content-DEFAULT dark:text-stone-300"
                    >
                      {service.name} - ${service.price}
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <div className="text-sm text-primary-DEFAULT dark:text-orange-500 hover:text-primary-light dark:hover:text-orange-400 cursor-pointer">
              +{booking.optionalServices.length} add-ons
            </div>
          </Tooltip>
        )}

        <div className="flex justify-between items-center mt-4">
          <select
            value={booking.status || "pending"}
            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
            className={`${getStatusColor(
              booking.status
            )} px-2 py-1 rounded-lg text-sm`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="font-medium text-content-DEFAULT dark:text-white">
            ${booking.totalPrice || 0}
          </span>
        </div>
      </div>
    </div>
  );

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
          Booking Management
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-light" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-background-light dark:bg-stone-800 rounded-lg border border-border-DEFAULT dark:border-stone-700 text-content-DEFAULT dark:text-white w-full sm:w-auto"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">{paginatedBookings.map(renderMobileCard)}</div>

      {/* Desktop View */}
      <div className="hidden lg:block w-full overflow-x-auto bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.map((booking) => (
              <TableRow key={booking._id}>
                {/* Booking # */}
                <TableCell className="font-mono text-primary-DEFAULT dark:text-orange-500">
                  {booking.confirmationNumber}
                </TableCell>

                {/* Date & Time */}
                <TableCell className="text-content-DEFAULT dark:text-white">
                  {booking.dateTime}
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.name}
                    </div>
                    <div className="text-sm text-content-light dark:text-stone-400">
                      {booking.contact}
                    </div>
                    {booking.email && (
                      <div className="text-sm text-content-light dark:text-stone-400">
                        {booking.email}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Service */}
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.serviceName}
                    </div>
                    {booking.optionalServices?.length > 0 && (
                      <Tooltip
                        content={
                          <div className="space-y-2 bg-background-DEFAULT dark:bg-stone-700 p-2 rounded-md">
                            <p className="font-medium text-content-DEFAULT dark:text-white">
                              Optional Services:
                            </p>
                            <ul>
                              {booking.optionalServices.map((service) => (
                                <li
                                  key={service._id}
                                  className="text-content-DEFAULT dark:text-stone-300"
                                >
                                  {service.name} - ${service.price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        }
                      >
                        <div className="text-sm text-primary-DEFAULT dark:text-orange-500 hover:text-primary-light dark:hover:text-orange-400 cursor-pointer">
                          +{booking.optionalServices.length} add-ons
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>

                {/* Vehicle */}
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.vehicleType}
                    </div>
                    <div className="text-sm text-content-light dark:text-stone-400">
                      {booking.makeModel}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <select
                    value={booking.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(booking._id, e.target.value)
                    }
                    className={`${getStatusColor(
                      booking.status
                    )} px-2 py-1 rounded-lg text-sm border-0 focus:ring-1 focus:ring-primary-light dark:focus:ring-orange-500 cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>

                {/* Total */}
                <TableCell className="font-medium text-content-DEFAULT dark:text-white">
                  ${booking.totalPrice || 0}
                </TableCell>

                {/* History */}
                <TableCell>
                  <button
                    onClick={() => handleOpenEdit(booking)}
                    className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
                    title="Edit Booking"
                  >
                    <Edit className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
                  </button>
                </TableCell>

                {/* History */}
                <TableCell>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowHistoryModal(true);
                    }}
                    className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
                    title="View Status History"
                  >
                    <History className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-background-dark dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-content-DEFAULT dark:text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-background-dark dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-xl border border-border-light dark:border-stone-700 shadow-lg max-h-[90vh] overflow-y-auto">
            {" "}
            {/* Added these classes */}
            <h3 className="text-lg font-medium mb-4 text-content-dark dark:text-white">
              Edit Booking #{selectedBooking.confirmationNumber}
            </h3>
            {editErrors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                {editErrors.general}
              </div>
            )}
            <DateTimeSelector
              initialDateTime={editData.dateTime}
              onDateTimeChange={(newDateTime) =>
                setEditData((prev) => ({ ...prev, dateTime: newDateTime }))
              }
            />
            <div className="grid grid-cols-2 gap-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vehicle Type
                </label>
                <select
                  value={editData.vehicleType}
                  onChange={(e) =>
                    setEditData({ ...editData, vehicleType: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {editErrors.vehicleType && (
                  <p className="mt-1 text-sm text-red-500">
                    {editErrors.vehicleType}
                  </p>
                )}
              </div>

              {/* Make/Model */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Make & Model
                </label>
                <input
                  type="text"
                  value={editData.makeModel}
                  onChange={(e) =>
                    setEditData({ ...editData, makeModel: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                />
                {editErrors.makeModel && (
                  <p className="mt-1 text-sm text-red-500">
                    {editErrors.makeModel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Service
                </label>
                <select
                  value={editData.serviceId || ""}
                  onChange={(e) => {
                    const selectedService = services.find(
                      (s) => s._id === e.target.value
                    );
                    setEditData((prev) => ({
                      ...prev,
                      serviceId: e.target.value,
                      serviceName: selectedService?.name || "",
                      servicePrice:
                        selectedService?.vehiclePricing[prev.vehicleType] || 0,
                    }));
                  }}
                  className="w-full p-2 bg-background-light dark:bg-stone-800 rounded-lg"
                >
                  <option value="">Select Service</option>
                  {services?.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scent</label>
                <select
                  value={editData.selectedScent || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, selectedScent: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                >
                  <option value="">Select Scent</option>
                  {scents?.map((scent) => (
                    <option key={scent.id} value={scent.name}>
                      {scent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact
                </label>
                <input
                  type="text"
                  value={editData.contact}
                  onChange={(e) =>
                    setEditData({ ...editData, contact: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                />
                {editErrors.contact && (
                  <p className="mt-1 text-sm text-red-500">
                    {editErrors.contact}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Optional Services
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {optionalServices?.map((service) => {
                    // console.log('Rendering service:', service);
                    // console.log('Current editData.optionalServices:', editData.optionalServices);

                    const isChecked = editData.optionalServices.some(
                      (bookedService) =>
                        Number(bookedService.serviceId) === service.id
                    );

                    return (
                      <label
                        key={service._id}
                        className="flex items-center gap-2 p-2 border rounded-lg hover:bg-background-dark dark:hover:bg-stone-700"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleOptionalServiceToggle(service)}
                          className="rounded border-border-DEFAULT"
                        />
                        <span>
                          {service.name} (+${service.price})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              
              <div className="col-span-2">
                <div className="flex justify-between items-center p-3 bg-background-dark dark:bg-stone-700 rounded-lg">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold text-primary-DEFAULT dark:text-orange-500">
                    ${editData.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg bg-background-DEFAULT dark:bg-stone-700 border border-border-DEFAULT dark:border-stone-600 hover:bg-background-dark dark:hover:bg-stone-600 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBooking}
                className="px-4 py-2 rounded-lg bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-lg border border-border-light dark:border-stone-700 shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-content-dark dark:text-white">
              Update Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                  New Status
                </label>
                <div className="w-full p-2 bg-background-DEFAULT dark:bg-stone-900 border border-border-DEFAULT dark:border-stone-700 rounded-lg">
                  <span className="capitalize">
                    {newStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  disabled={isUpdating}
                  className="w-full p-2 bg-background-DEFAULT dark:bg-stone-900 border border-border-DEFAULT dark:border-stone-700 rounded-lg h-24 disabled:opacity-50"
                  placeholder="Add a note about this status change..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeStatusModal}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-background-DEFAULT dark:bg-stone-700 border border-border-DEFAULT dark:border-stone-600 hover:bg-background-dark dark:hover:bg-stone-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showHistoryModal && selectedBooking && (
        <StatusHistory
          history={selectedBooking.statusHistory || []}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingManager;
