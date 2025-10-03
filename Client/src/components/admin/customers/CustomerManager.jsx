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
import { Search, Phone, Mail, Calendar, DollarSign, ChevronLeft, ChevronRight, Plus, User, Clock, Star, Download, Trash2 } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import ExpressBooking from "./ExpressBooking";

const ITEMS_PER_PAGE = 20;

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState("lastSeen");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showExpressBooking, setShowExpressBooking] = useState(false);
  const [expressBookingCustomer, setExpressBookingCustomer] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    phone: "",
    name: "",
    email: "",
    preferences: {
      defaultVehicleType: "",
      notes: ""
    }
  });

  const fetchCustomers = useCallback(
    async (page) => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("page", page);
        qs.set("limit", ITEMS_PER_PAGE);
        qs.set("sortBy", sortBy);
        qs.set("sortOrder", sortOrder);
        if (debouncedSearch) qs.set("search", debouncedSearch);

        const data = await api.get(
          `${CONFIG.ENDPOINTS.CUSTOMERS.BASE}?${qs.toString()}`
        );
        if (data.success) {
          setCustomers(data.data || []);
          if (typeof data.total === "number") setTotal(data.total);
          if (typeof data.page === "number") setCurrentPage(data.page);
        }
      } catch (error) {
        if (error.message.includes("token")) {
          window.location.href = "/login";
        }
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, sortBy, sortOrder]
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, fetchCustomers]);

  const handleCreateCustomer = async () => {
    try {
      const response = await api.post(CONFIG.ENDPOINTS.CUSTOMERS.BASE, newCustomer);
      if (response.success) {
        await fetchCustomers(1);
        setShowCreateModal(false);
        setNewCustomer({
          phone: "",
          name: "",
          email: "",
          preferences: {
            defaultVehicleType: "",
            notes: ""
          }
        });
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      const response = await api.get(`${CONFIG.ENDPOINTS.CUSTOMERS.BASE}/${customer._id}`);
      if (response.success) {
        setSelectedCustomer(response.data);
        setShowCustomerModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    }
  };

  const handleAutoLinkBookings = async (customerId) => {
    try {
      const response = await api.post(`${CONFIG.ENDPOINTS.CUSTOMERS.BASE}/${customerId}/auto-link`);
      if (response.success) {
        await fetchCustomers(currentPage);
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setSelectedCustomer(response.data);
        }
      }
    } catch (error) {
      console.error("Failed to auto-link bookings:", error);
    }
  };

  const handleExpressBooking = (customer) => {
    setExpressBookingCustomer(customer);
    setShowExpressBooking(true);
  };

  const handleExpressBookingSuccess = () => {
    fetchCustomers(currentPage);
    setShowExpressBooking(false);
    setExpressBookingCustomer(null);
  };

  const handleExtractCustomers = async () => {
    if (!window.confirm(
      "This will extract customer information from all bookings in the last 3 months. " +
      "It may take a few minutes to complete. Continue?"
    )) {
      return;
    }

    try {
      setIsExtracting(true);
      const response = await api.post(CONFIG.ENDPOINTS.CUSTOMERS.EXTRACT_FROM_BOOKINGS);
      
      if (response.success) {
        alert(`Customer extraction completed!\n\n` +
              `Customers created: ${response.data.customersCreated}\n` +
              `Customers updated: ${response.data.customersUpdated}\n` +
              `Bookings linked: ${response.data.bookingsLinked}`);
        
        // Refresh the customer list
        await fetchCustomers(1);
      }
    } catch (error) {
      console.error("Failed to extract customers:", error);
      alert("Failed to extract customers. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDropAllCustomers = async () => {
    if (!window.confirm(
      "⚠️ DANGER: This will permanently delete ALL customer records. " +
      "This action cannot be undone. Are you absolutely sure?"
    )) {
      return;
    }

    if (!window.confirm(
      "Final confirmation: Type 'DELETE' to confirm deletion of all customer records."
    )) {
      return;
    }

    try {
      const response = await api.delete(CONFIG.ENDPOINTS.CUSTOMERS.DROP_ALL);
      
      if (response.success) {
        alert(`Successfully deleted ${response.data.deletedCount} customer records.`);
        
        // Refresh the customer list
        await fetchCustomers(1);
      }
    } catch (error) {
      console.error("Failed to drop customers:", error);
      alert("Failed to delete customer records. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const renderMobileCard = (customer) => (
    <div
      key={customer._id}
      className="p-4 bg-background-DEFAULT dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700 mb-4"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-medium text-content-DEFAULT dark:text-white">
            {customer.name || "Unknown Customer"}
          </h3>
          <p className="text-sm text-content-light dark:text-stone-400 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {customer.phone}
          </p>
        </div>
        <button
          onClick={() => handleViewCustomer(customer)}
          className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
        >
          <User className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-content-light dark:text-stone-400">Bookings</p>
          <p className="font-medium text-content-DEFAULT dark:text-white">
            {customer.statistics?.totalBookings || 0}
          </p>
        </div>
        <div>
          <p className="text-content-light dark:text-stone-400">Total Spent</p>
          <p className="font-medium text-content-DEFAULT dark:text-white">
            {formatCurrency(customer.statistics?.totalSpent)}
          </p>
        </div>
        <div>
          <p className="text-content-light dark:text-stone-400">Last Booking</p>
          <p className="font-medium text-content-DEFAULT dark:text-white">
            {formatDate(customer.statistics?.lastBookingDate)}
          </p>
        </div>
        <div>
          <p className="text-content-light dark:text-stone-400">Last Seen</p>
          <p className="font-medium text-content-DEFAULT dark:text-white">
            {formatDate(customer.lastSeen)}
          </p>
        </div>
      </div>

      {customer.preferences?.vipStatus && (
        <div className="mt-3 flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">VIP Customer</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold text-content-dark dark:text-white">
          Customer Management
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDropAllCustomers}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Drop All</span>
          </button>
          <button
            onClick={handleExtractCustomers}
            disabled={isExtracting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExtracting ? "Extracting..." : "Extract from Bookings"}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-light" />
          <Input
            type="text"
            placeholder="Search by phone, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("-");
            setSortBy(sort);
            setSortOrder(order);
          }}
          className="px-4 py-2 bg-background-light dark:bg-stone-800 rounded-lg border border-border-DEFAULT dark:border-stone-700 text-content-DEFAULT dark:text-white"
        >
          <option value="lastSeen-desc">Last Seen (Recent)</option>
          <option value="lastSeen-asc">Last Seen (Oldest)</option>
          <option value="statistics.totalBookings-desc">Most Bookings</option>
          <option value="statistics.totalSpent-desc">Highest Spent</option>
          <option value="name-asc">Name (A-Z)</option>
        </select>
      </div>

      {/* Mobile View */}
      {loading && (
        <div className="lg:hidden flex justify-center items-center h-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-light dark:border-orange-500" />
        </div>
      )}
      <div className="lg:hidden">{customers.map(renderMobileCard)}</div>

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
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Booking</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium text-content-DEFAULT dark:text-white">
                        {customer.name || "Unknown Customer"}
                      </div>
                      {customer.preferences?.vipStatus && (
                        <div className="flex items-center gap-1 text-amber-500 text-sm">
                          <Star className="w-3 h-3" />
                          <span>VIP</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-content-light" />
                      <span className="text-content-DEFAULT dark:text-white">
                        {customer.phone}
                      </span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-content-light" />
                        <span className="text-content-DEFAULT dark:text-white">
                          {customer.email}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-center">
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {customer.statistics?.totalBookings || 0}
                    </div>
                    <div className="text-sm text-content-light dark:text-stone-400">
                      bookings
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-content-DEFAULT dark:text-white">
                      {formatCurrency(customer.statistics?.totalSpent)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3 text-content-light" />
                    <span className="text-content-DEFAULT dark:text-white">
                      {formatDate(customer.statistics?.lastBookingDate)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3 h-3 text-content-light" />
                    <span className="text-content-DEFAULT dark:text-white">
                      {formatDate(customer.lastSeen)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
                      title="View Customer Details"
                    >
                      <User className="w-4 h-4 text-primary-DEFAULT dark:text-orange-500" />
                    </button>
                    <button
                      onClick={() => handleAutoLinkBookings(customer._id)}
                      className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
                      title="Auto-link Bookings"
                    >
                      <Search className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
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

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-md border border-border-light dark:border-stone-700 shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-content-dark dark:text-white">
              Create New Customer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="555-123-4567"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={newCustomer.preferences.notes}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      preferences: {
                        ...newCustomer.preferences,
                        notes: e.target.value
                      }
                    })
                  }
                  placeholder="Customer preferences or notes..."
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800 h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-background-DEFAULT dark:bg-stone-700 border border-border-DEFAULT dark:border-stone-600 hover:bg-background-dark dark:hover:bg-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.phone}
                className="px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-DEFAULT transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-4xl border border-border-light dark:border-stone-700 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-medium text-content-dark dark:text-white">
                  {selectedCustomer.name || "Unknown Customer"}
                </h3>
                <p className="text-content-light dark:text-stone-400">
                  {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-content-dark dark:text-white mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-content-light" />
                      <span className="text-content-DEFAULT dark:text-white">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-content-light" />
                        <span className="text-content-DEFAULT dark:text-white">
                          {selectedCustomer.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-content-dark dark:text-white mb-2">
                    Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-content-light dark:text-stone-400">
                        Total Bookings:
                      </span>
                      <span className="font-medium text-content-DEFAULT dark:text-white">
                        {selectedCustomer.statistics?.totalBookings || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-light dark:text-stone-400">
                        Total Spent:
                      </span>
                      <span className="font-medium text-content-DEFAULT dark:text-white">
                        {formatCurrency(selectedCustomer.statistics?.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-light dark:text-stone-400">
                        Average Booking:
                      </span>
                      <span className="font-medium text-content-DEFAULT dark:text-white">
                        {formatCurrency(selectedCustomer.statistics?.averageBookingValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-content-dark dark:text-white mb-2">
                    Preferences
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.preferences?.defaultVehicleType && (
                      <div className="flex justify-between">
                        <span className="text-content-light dark:text-stone-400">
                          Default Vehicle:
                        </span>
                        <span className="font-medium text-content-DEFAULT dark:text-white">
                          {selectedCustomer.preferences.defaultVehicleType}
                        </span>
                      </div>
                    )}
                    {selectedCustomer.preferences?.vipStatus && (
                      <div className="flex items-center gap-2 text-amber-500">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">VIP Customer</span>
                      </div>
                    )}
                    {selectedCustomer.preferences?.notes && (
                      <div>
                        <span className="text-content-light dark:text-stone-400">
                          Notes:
                        </span>
                        <p className="text-content-DEFAULT dark:text-white mt-1">
                          {selectedCustomer.preferences.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-content-dark dark:text-white mb-2">
                    Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAutoLinkBookings(selectedCustomer._id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Auto-link Existing Bookings
                    </button>
                    <button 
                      onClick={() => handleExpressBooking(selectedCustomer)}
                      className="w-full px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors dark:bg-orange-500 dark:hover:bg-orange-600"
                    >
                      Express Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div>
              <h4 className="font-medium text-content-dark dark:text-white mb-4">
                Recent Bookings ({selectedCustomer.bookingIds?.length || 0})
              </h4>
              {selectedCustomer.bookingIds?.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.bookingIds.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-3 bg-background-DEFAULT dark:bg-stone-700 rounded-lg border border-border-light dark:border-stone-600"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-primary-DEFAULT dark:text-orange-500">
                            {booking.confirmationNumber}
                          </span>
                          <span className="ml-4 text-content-DEFAULT dark:text-white">
                            {booking.serviceName}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-content-DEFAULT dark:text-white">
                            {formatCurrency(booking.totalPrice)}
                          </div>
                          <div className="text-sm text-content-light dark:text-stone-400">
                            {booking.dateTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-content-light dark:text-stone-400 text-center py-4">
                  No bookings found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Express Booking Modal */}
      {showExpressBooking && expressBookingCustomer && (
        <ExpressBooking
          customer={expressBookingCustomer}
          onClose={() => {
            setShowExpressBooking(false);
            setExpressBookingCustomer(null);
          }}
          onSuccess={handleExpressBookingSuccess}
        />
      )}
    </div>
  );
};

export default CustomerManager;