import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/lib/auth/store';
import { createAppointment, createBlockOutTime } from '@/lib/api/appointments';
import { getPatients } from '@/lib/api/patients';
import AppointmentForm from '@/components/appointments/appointment-form';

// Mock the dependencies
jest.mock('@/lib/auth/store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/api/appointments', () => ({
  createAppointment: jest.fn(),
  createBlockOutTime: jest.fn(),
}));

jest.mock('@/lib/api/patients', () => ({
  getPatients: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (cb: any) => (data: any) => cb(data),
    formState: { errors: {} },
    control: {},
    reset: jest.fn(),
    watch: jest.fn().mockReturnValue('appointment'),
  }),
}));

describe('AppointmentForm', () => {
  const mockAuthStore = {
    token: 'mock-token',
    user: {
      id: 1,
      username: 'dentist',
      role: 'dentist',
    },
  };
  
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
  
  const mockPatients = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      gender: 'male',
      email: 'john@example.com',
      phone: '1234567890',
      is_active: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ];
  
  const mockProps = {
    appointmentTypes: mockAppointmentTypes,
    onClose: jest.fn(),
    onAppointmentCreated: jest.fn(),
    selectedDate: new Date(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
    (getPatients as jest.Mock).mockResolvedValue(mockPatients);
    (createAppointment as jest.Mock).mockResolvedValue({ id: 1 });
    (createBlockOutTime as jest.Mock).mockResolvedValue({ id: 1 });
  });
  
  it('renders the appointment form', async () => {
    render(<AppointmentForm {...mockProps} />);
    
    // Check if the title is rendered
    expect(screen.getByText('New Appointment')).toBeInTheDocument();
    
    // Check if the form fields are rendered
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    
    // Wait for the patients to be loaded
    await waitFor(() => {
      expect(getPatients).toHaveBeenCalled();
    });
  });
  
  it('closes the form when clicking on "Cancel"', async () => {
    render(<AppointmentForm {...mockProps} />);
    
    // Click on the "Cancel" button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if onClose was called
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
