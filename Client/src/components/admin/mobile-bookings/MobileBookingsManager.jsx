// src/components/admin/mobile-bookings/MobileBookingsManager.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Search, History, ChevronLeft, ChevronRight, Edit, MapPin } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import { useServices } from "../../../hooks/useServices";
import { useConfig } from "../../../hooks/useConfig";
import { Tooltip } from "../../ui/tooltip";
import StatusHistory from "../bookings/StatusHistory";
import DateTimeSelector from "../bookings/DateTimeSelector";
import MobileBookingCard from "./MobileBookingCard";

const ITEMS_PER_PAGE = 20;

const MobileBookingsManager = () => {
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
  const [depositFilter, setDepositFilter] = useState("all");
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
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch mobile bookings only
  const fetchMobileBookings = useCallback(
    async (page) => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("page", page);
        qs.set("limit", ITEMS_PER_PAGE);
        qs.set("serviceType", "mobile"); // Filter for mobile bookings only
        if (filter && filter !== "all") qs.set("status", filter);
        if (depositFilter && depositFilter !== "all") qs.set("depositFilter", depositFilter);
        if (debouncedSearch) qs.set("search", debouncedSearch);

        const data = await api.get(
          `${CONFIG.ENDPOINTS.BOOKINGS.BASE}?${qs.toString()}`
        );
        if (data.success) {
          setBookings(data.data || []);
          if (typeof data.total === "number") setTotal(data.total);
          if (typeof data.page === "number") setCurrentPage(data.page);
        }
      } catch (error) {
        if (error.message.includes("token")) {
          window.location.href = "/login";
        }
        console.error("Failed to fetch mobile bookings:", error);
      } finally {
        setLoading(false);
      }
    },
    [filter, depositFilter, debouncedSearch]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, depositFilter, debouncedSearch]);

  useEffect(() => {
    fetchMobileBookings(currentPage);
  }, [currentPage, fetchMobileBookings]);

  useEffect(() => {
    const calculatePrice = async () => {
      if (!editData.serviceId || !editData.vehicleType || !services) {
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
    const d = new Date(date);
    const datePart = d.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  };

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

  const handleOpenEdit = (booking) => {
    try {
      setSelectedBooking(booking);

      const mappedOptionalServices = (booking.optionalServices || []).map(
        (bookingService) => ({
          serviceId: bookingService.serviceId?.toString(),
          name: bookingService.name,
          price: bookingService.price,
          _id: bookingService._id,
        })
      );

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
        await fetchMobileBookings(currentPage);
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

  const handleOptionalServiceToggle = (service) => {
    setEditData((prev) => {
      const serviceId = Number(service.id);
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
                serviceId: Number(service.id),
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
      setIsUpdating(true);

      const response = await api.put(
        CONFIG.ENDPOINTS.BOOKINGS.UPDATE_STATUS(selectedBooking._id),
        {
          status: newStatus,
          note: statusNote,
        }
      );

      if (response.success) {
        await fetchMobileBookings(currentPage);
        closeStatusModal();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedBooking(null);
    setNewStatus(null);
    setStatusNote("");
  };


  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const displayedBookings = bookings;

  // Helper functions for desktop table
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

  const getDepositStatusColor = (depositRequired, depositPaid) => {
    if (!depositRequired) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    if (depositPaid) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  const formatAddress = (address) => {
    if (!address) return "No address";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const getDirectionsUrl = (address) => {
    if (!address) return "#";
    const encodedAddress = encodeURIComponent(formatAddress(address));
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  };

  const handleOpenHistory = async (booking) => {
    try {
      setSelectedBooking(booking);
      setShowHistoryModal(true);
      const result = await api.get(
        `${CONFIG.ENDPOINTS.BOOKINGS.BASE}/${booking._id}`
      );
      if (result.success) {
        setSelectedBooking(result.data);
      }
    } catch (error) {
      console.error("Failed to load status history:", error);
    }
  };


  const renderMobileCard = (booking) => (
    <MobileBookingCard
      key={booking._id}
      booking={booking}
      onStatusChange={handleStatusChange}
      onEdit={handleOpenEdit}
      onHistory={handleOpenHistory}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-dark dark:text-white">
          Mobile Bookings Management
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-light" />
          <Input
            type="text"
            placeholder="Search mobile bookings..."
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
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={depositFilter}
          onChange={(e) => setDepositFilter(e.target.value)}
          className="px-4 py-2 bg-background-light dark:bg-stone-800 rounded-lg border border-border-DEFAULT dark:border-stone-700 text-content-DEFAULT dark:text-white w-full sm:w-auto"
        >
          <option value="all">All Deposits</option>
          <option value="paid">Deposits Paid</option>
          <option value="unpaid">Deposits Unpaid</option>
        </select>
      </div>

      {/* Mobile View */}
      {loading && (
        <div className="lg:hidden flex justify-center items-center h-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-light dark:border-orange-500" />
        </div>
      )}
      <div className="lg:hidden">{displayedBookings.map(renderMobileCard)}</div>

      {/* Desktop View */}
      <div className="hidden lg:block relative w-full overflow-x-auto bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700">
        {loading && (
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8%] min-w-[90px]">Booking #</TableHead>
              <TableHead className="w-[12%] min-w-[120px]">Date & Time</TableHead>
              <TableHead className="w-[14%] min-w-[140px]">Customer</TableHead>
              <TableHead className="w-[16%] min-w-[160px]">Address</TableHead>
              <TableHead className="w-[12%] min-w-[120px]">Service</TableHead>
              <TableHead className="w-[10%] min-w-[100px]">Vehicle</TableHead>
              <TableHead className="w-[8%] min-w-[80px]">Deposit</TableHead>
              <TableHead className="w-[8%] min-w-[80px]">Status</TableHead>
              <TableHead className="w-[8%] min-w-[80px]">Total</TableHead>
              <TableHead className="w-[6%] min-w-[60px] text-center">Edit</TableHead>
              <TableHead className="w-[6%] min-w-[60px] text-center">History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBookings.map((booking) => (
              <TableRow key={booking._id}>
                {/* Booking # */}
                <TableCell className="font-mono text-primary-DEFAULT dark:text-orange-500 text-xs lg:text-sm">
                  {booking.confirmationNumber}
                </TableCell>

                {/* Date & Time */}
                <TableCell className="text-content-DEFAULT dark:text-white text-xs lg:text-sm">
                  {booking.dateTime}
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-content-DEFAULT dark:text-white text-xs lg:text-sm">
                      {booking.name}
                    </div>
                    <div className="text-sm font-semibold text-content-DEFAULT dark:text-stone-300">
                      {booking.contact}
                    </div>
                    {booking.email && (
                      <div
                        className="text-xs text-content-light dark:text-stone-400 truncate"
                        title={booking.email}
                      >
                        {booking.email}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Address */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-content-light dark:text-stone-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs lg:text-sm text-content-DEFAULT dark:text-stone-300">
                          {formatAddress(booking.customerAddress)}
                        </div>
                        {booking.distanceFromStore > 0 && (
                          <div className="text-xs text-content-light dark:text-stone-400">
                            {booking.distanceFromStore.toFixed(1)} mi
                          </div>
                        )}
                        <a
                          href={getDirectionsUrl(booking.customerAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-DEFAULT dark:text-orange-500 hover:underline"
                        >
                          Directions →
                        </a>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Service */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-content-DEFAULT dark:text-white text-xs lg:text-sm">
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
                        <div className="text-xs text-primary-DEFAULT dark:text-orange-500 hover:text-primary-light dark:hover:text-orange-400 cursor-pointer">
                          +{booking.optionalServices.length} add-ons
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>

                {/* Vehicle */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-content-DEFAULT dark:text-white text-xs lg:text-sm">
                      {booking.vehicleType}
                    </div>
                    <div className="text-xs text-content-light dark:text-stone-400">
                      {booking.makeModel}
                    </div>
                  </div>
                </TableCell>

                {/* Deposit */}
                <TableCell>
                  {booking.depositRequired ? (
                    <div className="space-y-0.5">
                      <span className={`px-2 py-1 rounded-full text-xs ${getDepositStatusColor(booking.depositRequired, booking.depositPaid)}`}>
                        {booking.depositPaid ? "Paid" : "Due"}
                      </span>
                      <div className="text-xs text-content-light dark:text-stone-400">
                        ${booking.depositAmount}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-content-light dark:text-stone-400">
                      N/A
                    </span>
                  )}
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
                    )} w-full px-2 py-1.5 rounded-lg text-xs lg:text-sm border-0 focus:ring-1 focus:ring-primary-light dark:focus:ring-orange-500 cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>

                {/* Total */}
                <TableCell className="font-medium text-content-DEFAULT dark:text-white text-xs lg:text-sm whitespace-nowrap">
                  ${booking.totalPrice || 0}
                </TableCell>

                {/* Edit */}
                <TableCell className="text-center">
                  <button
                    onClick={() => handleOpenEdit(booking)}
                    className="p-1.5 lg:p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors mx-auto"
                    title="Edit Booking"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5 text-primary-DEFAULT dark:text-orange-500" />
                  </button>
                </TableCell>

                {/* History */}
                <TableCell className="text-center">
                  <button
                    onClick={() => handleOpenHistory(booking)}
                    className="p-1.5 lg:p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors mx-auto"
                    title="View Status History"
                  >
                    <History className="w-4 h-4 lg:w-5 lg:h-5 text-primary-DEFAULT dark:text-orange-500" />
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

      {/* Edit Modal - Reuse from BookingManager */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-xl border border-border-light dark:border-stone-700 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4 text-content-dark dark:text-white">
              Edit Mobile Booking #{selectedBooking.confirmationNumber}
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
              <div>
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
              Update Mobile Booking Status
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

export default MobileBookingsManager;