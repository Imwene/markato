import { render, screen } from '@testing-library/react';
import { jest, describe, test, expect } from '@jest/globals';
import MobileBookingCard from '../MobileBookingCard';

// Mock booking data for testing
const mockBooking = {
  _id: '123',
  confirmationNumber: 'MB-001',
  name: 'John Doe',
  serviceName: 'Premium Wash',
  vehicleType: 'Sedan',
  makeModel: 'Toyota Camry',
  dateTime: 'Mon, Dec 16, 2024, 10:00 AM',
  totalPrice: 50,
  status: 'pending',
  distanceFromStore: 3.5,
  customerAddress: {
    street: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210'
  },
  contact: '555-123-4567',
  email: 'john@example.com',
  depositRequired: true,
  depositPaid: false,
  depositAmount: 25,
  optionalServices: [
    { _id: '1', name: 'Wax', price: 10 },
    { _id: '2', name: 'Interior Clean', price: 15 }
  ]
};

// Mock functions
const mockOnStatusChange = jest.fn();
const mockOnEdit = jest.fn();
const mockOnHistory = jest.fn();

describe('MobileBookingCard', () => {
  test('renders booking information correctly', () => {
    render(
      <MobileBookingCard
        booking={mockBooking}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onHistory={mockOnHistory}
      />
    );

    // Check if key elements are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Premium Wash')).toBeInTheDocument();
    expect(screen.getByText('Sedan - Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('MB-001')).toBeInTheDocument();
  });

  test('renders status badge correctly', () => {
    render(
      <MobileBookingCard
        booking={mockBooking}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onHistory={mockOnHistory}
      />
    );

    const statusBadge = screen.getByText('Pending');
    expect(statusBadge).toBeInTheDocument();
  });

  test('renders distance indicator correctly', () => {
    render(
      <MobileBookingCard
        booking={mockBooking}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onHistory={mockOnHistory}
      />
    );

    const distanceIndicator = screen.getByText('3.5 mi');
    expect(distanceIndicator).toBeInTheDocument();
  });

  test('renders deposit status correctly', () => {
    render(
      <MobileBookingCard
        booking={mockBooking}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onHistory={mockOnHistory}
      />
    );

    const depositStatus = screen.getByText('Deposit Due');
    expect(depositStatus).toBeInTheDocument();
  });

  test('expandable details work correctly', () => {
    render(
      <MobileBookingCard
        booking={mockBooking}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onHistory={mockOnHistory}
      />
    );

    // Initially, details should be hidden
    expect(screen.queryByText('123 Main St, Los Angeles, CA 90210')).not.toBeInTheDocument();
    
    // Click "Show More" button
    const showMoreButton = screen.getByText('Show More');
    showMoreButton.click();
    
    // Now details should be visible
    expect(screen.getByText('123 Main St, Los Angeles, CA 90210')).toBeInTheDocument();
  });
});