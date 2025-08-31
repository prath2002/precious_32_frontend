import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { createPatient } from '@/lib/api/patients';
import NewPatientPage from '@/app/patients/new/page';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/auth/store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/lib/api/patients', () => ({
  createPatient: jest.fn(),
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
  }),
}));

describe('NewPatientPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockAuthStore = {
    token: 'mock-token',
    user: {
      id: 1,
      username: 'dentist',
      role: 'dentist',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
    (createPatient as jest.Mock).mockResolvedValue({ id: 1 });
  });

  it('renders the new patient form', () => {
    render(<NewPatientPage />);

    // Check if the title is rendered
    expect(screen.getByText('New Patient')).toBeInTheDocument();

    // Check if the form sections are rendered
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Medical Information')).toBeInTheDocument();
    expect(screen.getByText('Dental History')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    expect(screen.getByText('Insurance Information')).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(screen.getByText('Create Patient')).toBeInTheDocument();
  });

  it('navigates back when clicking on "Cancel"', () => {
    render(<NewPatientPage />);

    // Click on the "Cancel" button
    fireEvent.click(screen.getAllByText('Cancel')[0]);

    // Check if the router was called
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('hides medical and insurance sections for receptionist', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      ...mockAuthStore,
      user: {
        ...mockAuthStore.user,
        role: 'receptionist',
      },
    });

    render(<NewPatientPage />);

    // Check if the medical and insurance sections are not rendered
    expect(screen.queryByText('Medical Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Dental History')).not.toBeInTheDocument();
    expect(screen.queryByText('Insurance Information')).not.toBeInTheDocument();
  });
});
