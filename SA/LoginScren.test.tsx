import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

import { loginUser } from '@/services/auth';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

// -------------------- MOCKS --------------------

jest.mock('@/services/auth', () => ({
  loginUser: jest.fn(),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock child components so we control input easily
jest.mock('@/components/AuthInput', () => (props) => {
  const { TextInput } = require('react-native');
  return <TextInput testID="email-input" {...props} />;
});

jest.mock('@/components/AuthPasswordInput', () => (props) => {
  const { TextInput } = require('react-native');
  return <TextInput testID="password-input" {...props} />;
});

jest.mock('@/components/AuthButton', () => (props) => {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity onPress={props.onPress} testID="login-button">
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
});

// -------------------- TESTS --------------------

describe('LoginScreen', () => {
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useToast.mockReturnValue({
      showToast: mockShowToast,
    });

    useAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      authLoading: false,
    });
  });

  // -------------------- 1. SUBMIT TEST --------------------
  test('submits login form with correct values', async () => {
    loginUser.mockResolvedValue({
      message: 'Success',
      user: {
        formFinished: true,
      },
    });

    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@gmail.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith(
        'test@gmail.com',
        'password123'
      );
    });
  });

  // -------------------- 2. VALIDATION TESTS --------------------
  test('shows error when email is empty', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), '');
    fireEvent.changeText(getByTestId('password-input'), 'password123');

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Email is required',
        'error'
      );
      expect(loginUser).not.toHaveBeenCalled();
    });
  });

  test('shows error for invalid email format', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'invalidemail');
    fireEvent.changeText(getByTestId('password-input'), 'password123');

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Invalid email format',
        'error'
      );
      expect(loginUser).not.toHaveBeenCalled();
    });
  });

  test('shows error when password is empty', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@gmail.com');
    fireEvent.changeText(getByTestId('password-input'), '');

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Password is required',
        'error'
      );
      expect(loginUser).not.toHaveBeenCalled();
    });
  });
});