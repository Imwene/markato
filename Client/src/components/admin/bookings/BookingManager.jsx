// src/components/admin/bookings/BookingManager.jsx
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
import { Badge } from "../../ui/badge";
import { Tooltip } from "../../ui/tooltip";
import { Search } from "lucide-react";
import api from '../../../utils/api';
import {CONFIG } from '../../../config/config';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.get(CONFIG.ENDPOINTS.BOOKINGS.BASE);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, selectedStatus) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setSelectedBooking(booking);
    setNewStatus(selectedStatus);
    setStatusNote("");
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;
  
    try {
      const response = await api.put(
        CONFIG.ENDPOINTS.BOOKINGS.UPDATE_STATUS(selectedBooking._id),
        {
          status: newStatus,
          note: statusNote,
        }
      );
  
      if (response.success) {
        setBookings(
          bookings.map((b) =>
            b._id === selectedBooking._id ? { ...b, status: newStatus } : b
          )
        );
        closeStatusModal();
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (booking.contact || "").includes(searchTerm) ||
      (booking.confirmationNumber || "").includes(searchTerm);

    if (filter === "all") return matchesSearch;
    return matchesSearch && booking.status === filter;
  });

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
        <h1 className="text-2xl font-bold text-content-dark">
          Booking Management
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-light" />
          <Input
            type="text"
            placeholder="Search by name, phone, or confirmation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-background-light rounded-lg border border-border-DEFAULT text-content-DEFAULT w-full sm:w-auto"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background-light p-6 rounded-lg w-full max-w-lg border border-border-DEFAULT shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-content-dark">
              Update Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-content-DEFAULT">
                  New Status
                </label>
                <div className="w-full p-2 bg-background-DEFAULT border border-border-DEFAULT rounded-lg text-content-DEFAULT">
                  <span className="capitalize">
                    {newStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-content-DEFAULT">
                  Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2 bg-background-light border border-border-DEFAULT rounded-lg h-24 text-content-DEFAULT"
                  placeholder="Add a note about this status change..."
                />
              </div>

              <div>
                <h4 className="font-medium mb-2 text-content-DEFAULT">
                  Status History
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedBooking.statusHistory?.map((history, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-background-DEFAULT rounded-lg border border-border-light"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium capitalize text-content-DEFAULT">
                          {history.status.replace("_", " ")}
                        </span>
                        <span className="text-content-light">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-content-light mt-1">
                          {history.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 bg-background-DEFAULT text-content-DEFAULT rounded-lg hover:bg-background-dark border border-border-DEFAULT transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="w-full overflow-x-auto bg-background-light rounded-lg border border-border-light relative z-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">Booking #</TableHead>
              <TableHead className="w-[15%]">Date & Time</TableHead>
              <TableHead className="w-[20%]">Customer</TableHead>
              <TableHead className="w-[20%]">Service</TableHead>
              <TableHead className="w-[15%]">Vehicle</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[10%]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking._id || booking.confirmationNumber}>
                <TableCell className="font-mono text-primary-DEFAULT">
                  {booking.confirmationNumber || "N/A"}
                </TableCell>
                <TableCell className="text-content-DEFAULT">
                  {booking.dateTime || "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT">
                      {booking.name || "N/A"}
                    </div>
                    <div className="text-sm text-content-light">
                      {booking.contact || "N/A"}
                    </div>
                    {booking.email && (
                      <div className="text-sm text-content-light">
                        {booking.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT">
                      {booking.serviceName || "N/A"}
                    </div>
                    {booking.optionalServices?.length > 0 ? (
                      <Tooltip
                        content={
                          <div className="space-y-2">
                            <p className="font-medium text-primary-DEFAULT">
                              Optional Services:
                            </p>
                            {booking.optionalServices.map((service, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-content-DEFAULT"
                              >
                                <span>{service.name}</span>
                                <span className="text-primary-DEFAULT">
                                  ${service.price}
                                </span>
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <div className="text-sm text-primary-DEFAULT hover:text-primary-light cursor-pointer">
                          +{booking.optionalServices.length} add-ons
                        </div>
                      </Tooltip>
                    ) : (
                      <div className="text-sm text-content-light">
                        No add-ons
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT">
                      {booking.vehicleType || "N/A"}
                    </div>
                    <div className="text-sm text-content-light">
                      {booking.makeModel || "N/A"}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <select
                    value={booking.status || "pending"}
                    onChange={(e) =>
                      handleStatusChange(booking._id, e.target.value)
                    }
                    className={`${getStatusColor(
                      booking.status
                    )} px-2 py-1 rounded-lg text-sm border-0 focus:ring-1 focus:ring-primary-light cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell className="font-medium text-content-DEFAULT">
                  ${booking.totalPrice || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingManager;
