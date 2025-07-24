import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import App from './App';

// ---- Helper Mocks for Storage, Alerts, & Confirm ----
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => (key in store ? store[key] : null)),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _store: store,
    mockRestore: () => {
      store = {};
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
      localStorageMock.removeItem.mockClear();
      localStorageMock.clear.mockClear();
    }
  };
})();

const mockConfirm = jest.fn(() => true);
const mockAlert = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.confirm = mockConfirm;
  window.alert = mockAlert;
});

beforeEach(() => {
  localStorageMock.mockRestore();
  mockConfirm.mockReset();
  mockAlert.mockReset();
});

describe('Authentication flow', () => {
  test('successful login with default demo credentials', () => {
    render(<App />);
    // Should show login screen
    expect(screen.getByRole('heading', { name: /attendance app login/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'kavia123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Authenticated UI (sidebar, student manager) should now be visible
    expect(screen.getByText(/student manager/i)).toBeInTheDocument();
  });

  test('shows error for invalid login and demo shortcut works', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'demo' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'demo' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.queryByText(/attendance app login/i)).not.toBeInTheDocument();
    expect(screen.getByText(/student manager/i)).toBeInTheDocument();
  });
});

describe('Student Management (Add, Edit, Delete)', () => {
  beforeEach(() => {
    // Login first
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'kavia123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // Start on student manager view
    expect(screen.getByText(/student manager/i)).toBeInTheDocument();
  });

  test('shows empty state and can add a student', async () => {
    expect(screen.getByText(/no students yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    expect(screen.getByRole('heading', { name: /add student/i })).toBeInTheDocument();

    // Attempt empty submission
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText(/all fields required/i)).toBeInTheDocument();

    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S001' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByText('Smith, Alice')).toBeInTheDocument();
    expect(screen.getByText('S001')).toBeInTheDocument();

    // localStorage should update
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_users',
      expect.stringContaining('Alice')
    );
  });

  test('edit student flow works and persists', () => {
    // Add student
    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Brown' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S002' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    // Now check
    const row = screen.getByText('Brown, Bob').closest('tr');
    expect(row).toHaveTextContent('S002');

    // Edit student
    const editButton = within(row).getByTitle(/edit/i);
    fireEvent.click(editButton);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Robert' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(screen.getByText('Brown, Robert')).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_users',
      expect.stringContaining('Robert')
    );
  });

  test('delete student removes from UI and from attendance records', async () => {
    // Add two students
    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Carol' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Jones' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S003' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Dan' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Mills' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S004' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    // Navigate to attendance, mark attendance for both, save
    fireEvent.click(screen.getByRole('button', { name: /mark attendance/i }));
    // Use the select and input by name
    const selects = screen.getAllByLabelText(/attendance status for/i);
    fireEvent.change(selects[0], { target: { value: 'present' } });
    fireEvent.change(selects[1], { target: { value: 'absent' } });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(mockAlert).toHaveBeenCalledWith(expect.stringMatching(/attendance saved/i));
    // Save should persist data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_records',
      expect.stringContaining('present')
    );

    // Go back to student manager
    fireEvent.click(screen.getByRole('button', { name: /students/i }));

    // Delete first student
    let carolRow = screen.getByText('Jones, Carol').closest('tr');
    const deleteBtn = within(carolRow).getByTitle(/delete/i);
    mockConfirm.mockReturnValueOnce(true);
    fireEvent.click(deleteBtn);

    // Carol gone, Dan remains
    expect(screen.queryByText('Jones, Carol')).toBeNull();
    expect(screen.getByText('Mills, Dan')).toBeInTheDocument();

    // localStorage called to persist user/attendance removal
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_users',
      expect.not.stringContaining('Carol')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_records',
      expect.not.stringContaining('Carol')
    );
  });
});

describe('Attendance Marking', () => {
  beforeEach(() => {
    // Login
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'kavia123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Add a student for attendance cases
    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Eve' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Adams' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S005' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    // Go to attendance marking
    fireEvent.click(screen.getByRole('button', { name: /mark attendance/i }));
    expect(screen.getByText(/mark attendance/i)).toBeVisible();
  });

  test('shows message if no students available', () => {
    // Remove all students
    fireEvent.click(screen.getByRole('button', { name: /students/i }));

    // Delete Eve
    const eveRow = screen.getByText('Adams, Eve').closest('tr');
    mockConfirm.mockReturnValueOnce(true);
    fireEvent.click(within(eveRow).getByTitle(/delete/i));
    expect(screen.queryByText('Adams, Eve')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark attendance/i }));
    expect(screen.getByText(/add students to mark attendance/i)).toBeInTheDocument();
  });

  test('marking present/absent and adding note saves correctly', async () => {
    const sel = screen.getByLabelText(/attendance status for eve adams/i);
    fireEvent.change(sel, { target: { value: 'present' } });
    const noteInput = screen.getByPlaceholderText('(optional)');
    fireEvent.change(noteInput, { target: { value: 'Late arrival' } });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'attendance_records',
      expect.stringContaining('Late arrival')
    );
    expect(mockAlert).toHaveBeenCalledWith(expect.stringMatching(/attendance saved/i));
  });
});

describe('Attendance History & Statistics', () => {
  beforeEach(() => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'kavia123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Add students
    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Frank' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'White' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S006' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    fireEvent.click(screen.getByRole('button', { name: /\+ add student/i }));
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Grace' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Black' } });
    fireEvent.change(screen.getByPlaceholderText('Student ID'), { target: { value: 'S007' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    // Mark attendance for both
    fireEvent.click(screen.getByRole('button', { name: /mark attendance/i }));
    const [frankSel, graceSel] = screen.getAllByLabelText(/attendance status for/i);
    fireEvent.change(frankSel, { target: { value: 'present' } });
    fireEvent.change(graceSel, { target: { value: 'absent' } });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    // Next, navigate to history
    fireEvent.click(screen.getByRole('button', { name: /history & stats/i }));
    expect(screen.getByText(/attendance history/i)).toBeInTheDocument();
  });

  test('shows correct history table and statistics', () => {
    expect(screen.getByText(/white, frank/i)).toBeInTheDocument();
    expect(screen.getByText(/black, grace/i)).toBeInTheDocument();
    expect(screen.getAllByText('Present').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Absent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/statistics/i)).toBeInTheDocument();

    const stats = screen.getByText('White, Frank').closest('tr');
    expect(stats).toHaveTextContent('1');
    expect(stats).toHaveTextContent('%');
  });

  test('displays empty state if no attendance records', async () => {
    // Remove all records
    localStorageMock.setItem('attendance_records', '{}');
    // Navigate away and back to force component rerender
    fireEvent.click(screen.getByRole('button', { name: /students/i }));
    fireEvent.click(screen.getByRole('button', { name: /history & stats/i }));

    expect(screen.getByText(/no attendance records yet/i)).toBeVisible();
  });
});

describe('Theme toggle and navigation', () => {
  beforeEach(() => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'teacher' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'kavia123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  });

  test('toggles light/dark theme', () => {
    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('can logout and returns to login screen', () => {
    // Sidebar logout button
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('navigates between student, attendance and history views', () => {
    fireEvent.click(screen.getByRole('button', { name: /mark attendance/i }));
    expect(screen.getByText(/mark attendance/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /history & stats/i }));
    expect(screen.getByText(/attendance history/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /students/i }));
    expect(screen.getByText(/students/i)).toBeVisible();
  });
});
