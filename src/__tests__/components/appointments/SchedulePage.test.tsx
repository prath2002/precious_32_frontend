import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { getAppointments, getAppointmentTypes } from '@/lib/api/appointments';
import SchedulePage from '@/app/schedule/page';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/api/appointments', () => ({
  getAppointments: jest.fn(),
  getAppointmentTypes: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/components/appointments/appointment-form', () => ({
  __esModule: true,
  default: ({ onClose, onAppointmentCreated }: any) => (
    <div data-testid="appointment-form">
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => onAppointmentCreated({ id: 1 })}>Create</button>
    </div>
  ),
}));

jest.mock('@/components/appointments/appointment-details', () => ({
  __esModule: true,
  default: ({ onClose, onAppointmentUpdated, onAppointmentCancelled }: any) => (
    <div data-testid="appointment-details">
      <button onClick={() => onClose()}>Close</button>
      <button onClick={() => onAppointmentUpdated({ id: 1 })}>Update</button>
      <button onClick={() => onAppointmentCancelled(1)}>Cancel</button>
    </div>
  ),
}));

describe('SchedulePage', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockAuthStore = {
    token: 'mock-token',
    user: {
      id: 1,
      username: 'dentist',
      role: 'dentist',
    },
  };
  
  const mockAppointments = [
    {
      id: 1,
      patient_id: 1,
      dentist_id: 1,
      appointment_type_id: 1,
      start_time: new Date().toISOString(),
      end_time: new Date(new Date().getTime() + 30 * 60000).toISOString(),
      status: 'scheduled',
      notes: 'Test appointment',
      is_block_out: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  
  const mockAppointmentTypes = [
    {
      id: 1,
      name: 'Regular Checkup',
      description: 'Regular dental checkup',
      duration_minutes: 30,
      color: '#3498db',
      is_active: true,
    },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
    (getAppointments as jest.Mock).mockResolvedValue(mockAppointments);
    (getAppointmentTypes as jest.Mock).mockResolvedValue(mockAppointmentTypes);
  });
  
  it('renders the schedule page', async () => {
    render(<SchedulePage />);
    
    // Check if the title is rendered
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    
    // Check if the view buttons are rendered
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    
    // Check if the "New Appointment" button is rendered
    expect(screen.getByText('New Appointment')).toBeInTheDocument();
    
    // Wait for the appointments to be loaded
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled();
      expect(getAppointmentTypes).toHaveBeenCalled();
    });
  });
  
  it('opens the appointment form when clicking on "New Appointment"', async () => {
    render(<SchedulePage />);
    
    // Wait for the appointments to be loaded
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled();
    });
    
    // Click on the "New Appointment" button
    fireEvent.click(screen.getByText('New Appointment'));
    
    // Check if the appointment form is rendered
    expect(screen.getByTestId('appointment-form')).toBeInTheDocument();
  });
  
  it('closes the appointment form when clicking on "Close"', async () => {
    render(<SchedulePage />);
    
    // Wait for the appointments to be loaded
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled();
    });
    
    // Click on the "New Appointment" button
    fireEvent.click(screen.getByText('New Appointment'));
    
    // Check if the appointment form is rendered
    expect(screen.getByTestId('appointment-form')).toBeInTheDocument();
    
    // Click on the "Close" button
    fireEvent.click(screen.getByText('Close'));
    
    // Check if the appointment form is closed
    await waitFor(() => {
      expect(screen.queryByTestId('appointment-form')).not.toBeInTheDocument();
    });
  });
  
  it('adds a new appointment when creating one', async () => {
    render(<SchedulePage />);
    
    // Wait for the appointments to be loaded
    await waitFor(() => {
      expect(getAppointments).toHaveBeenCalled();
    });
    
    // Click on the "New Appointment" button
    fireEvent.click(screen.getByText('New Appointment'));
    
    // Check if the appointment form is rendered
    expect(screen.getByTestId('appointment-form')).toBeInTheDocument();
    
    // Click on the "Create" button
    fireEvent.click(screen.getByText('Create'));
    
    // Check if the appointment form is closed
    await waitFor(() => {
      expect(screen.queryByTestId('appointment-form')).not.toBeInTheDocument();
    });
  });
});
