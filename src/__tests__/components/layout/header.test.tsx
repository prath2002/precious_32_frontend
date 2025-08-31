import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/header';

describe('Header', () => {
  it('renders the clinic name', () => {
    render(<Header />);
    
    const clinicName = screen.getByText('Briana Dental Clinic');
    expect(clinicName).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    render(<Header />);
    
    const logoutButton = screen.getByText('Log out');
    expect(logoutButton).toBeInTheDocument();
  });
});
