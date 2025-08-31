import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { useAuthStore } from '@/lib/auth/store';

// Mock the auth store
jest.mock('@/lib/auth/store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (useAuthStore as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation error when form is submitted without values', () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    
    expect(screen.getByText('Username and password are required')).toBeInTheDocument();
  });

  it('calls login function with credentials when form is submitted', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
    
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('shows loading state when isLoading is true', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: true,
      error: null,
    });
    
    render(<LoginPage />);
    
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when login fails', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: jest.fn(),
      isLoading: false,
      error: 'Invalid credentials',
    });
    
    render(<LoginPage />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
