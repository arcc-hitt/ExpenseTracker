import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal with title and children', () => {
    render(
      <Modal title="Test Modal" onClose={mockOnClose}>
        <p>Test content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal title="Test Modal" onClose={mockOnClose}>
        <p>Test content</p>
      </Modal>
    );

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom children', () => {
    render(
      <Modal title="Custom Modal" onClose={mockOnClose}>
        <div>
          <h4>Custom Title</h4>
          <button>Custom Button</button>
        </div>
      </Modal>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Button')).toBeInTheDocument();
  });
});