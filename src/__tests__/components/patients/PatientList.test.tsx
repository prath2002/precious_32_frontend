import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { getPatients } from '@/lib/api/patients';
import PatientsPage from '@/app/patients/page';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/store', () => ({
  useAuthStore: jest.fn(),
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

jest.mock('@/lib/hooks/use-debounce', () => ({
  useDebounce: (value: any) => value,
}));

describe('PatientsPage', () => {
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

  const mockPatients = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      gender: 'male',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      is_active: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '1985-05-15',
      gender: 'female',
      email: 'jane@example.com',
      phone: '0987654321',
      address: '456 Oak St',
      city: 'Somewhere',
      state: 'NY',
      postal_code: '54321',
      is_active: true,
      created_at: '2023-01-02',
      updated_at: '2023-01-02',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
    (getPatients as jest.Mock).mockResolvedValue(mockPatients);
  });

  it('renders the patients list', async () => {
    render(<PatientsPage />);

    // Check if the title is rendered
    expect(screen.getByText('Patients')).toBeInTheDocument();

    // Check if the search input is rendered
    expect(screen.getByPlaceholderText('Search patients by name, email, or phone...')).toBeInTheDocument();

    // Check if the "Add Patient" button is rendered
    expect(screen.getByText('Add Patient')).toBeInTheDocument();

    // Wait for the patients to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('navigates to patient details when clicking on a patient', async () => {
    render(<PatientsPage />);

    // Wait for the patients to be loaded
    await waitFor(() => {
      expect(screen.getAllByText('View')[0]).toBeInTheDocument();
    });

    // Click on the "View" button for the first patient
    fireEvent.click(screen.getAllByText('View')[0]);

    // Check if the router was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/patients/1');
  });

  it('navigates to the new patient page when clicking on "Add Patient"', () => {
    render(<PatientsPage />);

    // Click on the "Add Patient" button
    fireEvent.click(screen.getByText('Add Patient'));

    // Check if the router was called with the correct path
    expect(mockRouter.push).toHaveBeenCalledWith('/patients/new');
  });

  it('filters patients when searching', async () => {
    render(<PatientsPage />);

    // Wait for the patients to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Type in the search input
    fireEvent.change(
      screen.getByPlaceholderText('Search patients by name, email, or phone...'),
      { target: { value: 'John' } }
    );

    // Check if getPatients was called with the search term
    expect(getPatients).toHaveBeenCalledWith('mock-token', 'John');
  });

  it('shows a message when no patients are found', async () => {
    (getPatients as jest.Mock).mockResolvedValue([]);

    render(<PatientsPage />);

    // Wait for the patients to be loaded
    await waitFor(() => {
      expect(screen.getByText('No patients found. Add your first patient!')).toBeInTheDocument();
    });
  });
});
