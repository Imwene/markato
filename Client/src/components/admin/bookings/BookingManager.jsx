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
import { Search, Edit2 } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import { Tooltip } from "../../ui/tooltip";

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
      setLoading(true);
      const data = await api.get(CONFIG.ENDPOINTS.BOOKINGS.BASE);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      // Check if it's an auth error
      if (error.message.includes("token")) {
        // Redirect to login
        window.location.href = "/login";
      }
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
            placeholder="Search by name, phone, or confirmation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-background-light dark:bg-stone-800 
                     rounded-lg border border-border-DEFAULT dark:border-stone-700 
                     text-content-DEFAULT dark:text-white w-full sm:w-auto"
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
          <div
            className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-lg 
                          border border-border-light dark:border-stone-700 shadow-lg"
          >
            <h3 className="text-lg font-medium mb-4 text-content-dark dark:text-white">
              Update Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                  New Status
                </label>
                <div
                  className="w-full p-2 bg-background-DEFAULT dark:bg-stone-900 
                                border border-border-DEFAULT dark:border-stone-700 
                                rounded-lg text-content-DEFAULT dark:text-white"
                >
                  <span className="capitalize">
                    {newStatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                  Note (Optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2 bg-background-light dark:bg-stone-700 
                             border border-border-DEFAULT dark:border-stone-600 
                             rounded-lg h-24 text-content-DEFAULT dark:text-white"
                  placeholder="Add a note about this status change..."
                />
              </div>

              <div>
                <h4 className="font-medium mb-2 text-content-DEFAULT dark:text-white">
                  Status History
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedBooking.statusHistory?.map((history, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-background-DEFAULT dark:bg-stone-900 
                                  rounded-lg border border-border-light dark:border-stone-700"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium capitalize text-content-DEFAULT dark:text-white">
                          {history.status.replace("_", " ")}
                        </span>
                        <span className="text-content-light dark:text-stone-400">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-content-light dark:text-stone-400 mt-1">
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
                className="px-4 py-2 bg-background-DEFAULT dark:bg-stone-700 
                           text-content-DEFAULT dark:text-white 
                           rounded-lg hover:bg-background-dark dark:hover:bg-stone-600 
                           border border-border-DEFAULT dark:border-stone-600 
                           transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-primary-light dark:bg-orange-500 
                           text-white rounded-lg 
                           hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                           transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div
        className="w-full overflow-x-auto 
          bg-background-light dark:bg-stone-800 
          rounded-lg border border-border-light dark:border-stone-700 
          relative z-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%] text-content-light dark:text-stone-400">
                Booking #
              </TableHead>
              <TableHead className="w-[15%] text-content-light dark:text-stone-400">
                Date & Time
              </TableHead>
              <TableHead className="w-[20%] text-content-light dark:text-stone-400">
                Customer
              </TableHead>
              <TableHead className="w-[20%] text-content-light dark:text-stone-400">
                Service
              </TableHead>
              <TableHead className="w-[15%] text-content-light dark:text-stone-400">
                Vehicle
              </TableHead>
              <TableHead className="w-[10%] text-content-light dark:text-stone-400">
                Status
              </TableHead>
              <TableHead className="w-[10%] text-content-light dark:text-stone-400">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking._id || booking.confirmationNumber}>
                <TableCell className="font-mono text-primary-DEFAULT dark:text-orange-500">
                  {booking.confirmationNumber || "N/A"}
                </TableCell>
                <TableCell className="text-content-DEFAULT dark:text-white">
                  {booking.dateTime || "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.name || "N/A"}
                    </div>
                    <div className="text-sm text-content-light dark:text-stone-400">
                      {booking.contact || "N/A"}
                    </div>
                    {booking.email && (
                      <div className="text-sm text-content-light dark:text-stone-400">
                        {booking.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.serviceName || "N/A"}
                    </div>
                    {booking.optionalServices?.length > 0 ? (
                      <Tooltip
                        content={
                          <div className="space-y-2 bg-background-DEFAULT dark:bg-stone-700 p-2 rounded-md">
                            <p className="font-medium text-primary-DEFAULT">
                              Optional Services:
                            </p>
                            <ul>
                              {booking.optionalServices.map((service) => (
                                <li
                                  key={service._id}
                                  className="text-content-DEFAULT dark:text-white"
                                >
                                  {service.name} -{" "}
                                  <span className="text-primary-DEFAULT dark:text-orange-400">
                                    ${service.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        }
                      >
                        <div
                          className="text-sm text-primary-DEFAULT dark:text-orange-500 
                hover:text-primary-light dark:hover:text-orange-600 
                cursor-pointer"
                        >
                          {" "}
                          {/* Updated hover class */}+
                          {booking.optionalServices.length} add-ons
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
                    <div className="font-medium text-content-DEFAULT dark:text-white">
                      {booking.vehicleType || "N/A"}
                    </div>
                    <div className="text-sm text-content-light dark:text-stone-400">
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
                    )} px-2 py-1 rounded-lg text-sm border-0 
                               focus:ring-1 focus:ring-primary-light 
                               dark:focus:ring-orange-500 
                               cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell className="font-medium text-content-DEFAULT dark:text-white">
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
