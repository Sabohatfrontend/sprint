import React, { useState, useEffect } from 'react';
import { FaHome } from 'react-icons/fa';
import { createCustomer } from '../../../sdk/customerApi';
import { apiRoot } from '../../../sdk/client';
import {
  CustomerData,
  Address,
  FormErrors,
  CustomerResponse,
  CustomError,
} from '../../Interfaces/CustomerInterface';
import {
  isEmailValid,
  isPasswordValid,
  isNameValid,
  isDateOfBirthValid,
  isSimpleTextValid,
  isPostalCodeValid,
  isCountryValid,
  CountryCode,
  isCityValid,
} from '../../modules/validationUtils';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer, TypeOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Tooltip from '@mui/material/Tooltip';

const validCountries: CountryCode[] = [
  'US',
  'CA',
  'GE',
  'DE',
  'FR',
  'GB',
  'UZ',
  'PL',
  'ge',
  'ca',
  'us',
  'de',
  'fr',
  'gb',
  'uz',
  'pl',
];

import './Register.css';
const RegistrationForm = () => {
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    countryCode: 'GE',
    dateOfBirth: '',
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
    },
    shippingAddress: {
      street: '',
      city: '',
      postalCode: '',
    },
    useSameAddress: false,
    setAsDefaultAddress: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');
  const [toastShown, setToastShown] = useState<boolean>(false);
  const [errorToastShown, setErrorToastShown] = useState(false);

  const updateNestedState = <T extends object, K extends keyof T>(
    obj: T,
    key: K,
    value: Partial<T[K]>
  ): T => ({
    ...obj,
    [key]: {
      ...obj[key],
      ...value,
    },
  });

  const validateField = (
    name: keyof CustomerData | keyof Address,
    value: string | boolean,
    addressType?: 'billing' | 'shipping'
  ): void => {
    let error: string = '';

    switch (name) {
      case 'email':
        if (!isEmailValid(value as string)) error = 'Invalid email format';
        break;
      case 'password':
        if (!isPasswordValid(value as string)) {
          error = 'Invalid password data';
        }

        break;
      case 'firstName':
      case 'lastName':
        if (!isNameValid(value as string)) {
          error = 'Name must contain only letters and spaces';
        }
        break;
      case 'dateOfBirth':
        if (!isDateOfBirthValid(value as string)) {
          error = 'User must be at least 13 years old';
        }
        break;
      case 'street':
        if (!isSimpleTextValid(value as string)) {
          error = 'This field cannot be empty';
        }
        break;
      case 'city':
        if (!isSimpleTextValid(value as string)) {
          error = 'This field cannot be empty';
        } else if (!isCityValid(value as string)) {
          error = 'City cannot contain special characters or numbers';
        }
        break;
      case 'postalCode':
        if (
          !isPostalCodeValid(
            value as string,
            customerData.countryCode as CountryCode
          )
        ) {
          error = 'Invalid postal code for the country';
        }
        break;
      case 'countryCode':
        if (!isCountryValid(value as string, validCountries)) {
          error = 'Invalid country';
        }
        break;
    }

    if (addressType) {
      setErrors((prev) =>
        updateNestedState(prev, `${addressType}Address`, {
          [name]: error,
        } as Partial<Address>)
      );
    } else {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setCustomerData({
      ...customerData,
      [name]: fieldValue,
    });

    validateField(name as keyof CustomerData | keyof Address, fieldValue);

    // let typingTimer: ReturnType<typeof setTimeout>;

    // clearTimeout(typingTimer);

    // // Set a new timer for validation after typing stops
    // typingTimer = setTimeout(() => {
    //   validateField(name as keyof CustomerData | keyof Address, fieldValue);
    // }, 10000); // Adjust the delay as needed
  };

  const [tooltipError, setTooltipError] = useState<string>('');
  const handlePasswordChange = (password: string) => {
    setCustomerData((prevData) => ({ ...prevData, password }));

    const isValidPassword = isPasswordValid(password);

    if (!isValidPassword) {
      setTooltipError(
        'Password must be at least 8 characters long and include: an uppercase and a lowercase letter, a number, and a special character (!@#$%^&*.,)'
      );
    } else {
      setTooltipError('');
    }
    validateField('password', password);
  };

  const handleAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    addressType: 'billing' | 'shipping'
  ) => {
    const { name, value } = event.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [addressType === 'billing' ? 'billingAddress' : 'shippingAddress']: {
        ...prevData[
          addressType === 'billing' ? 'billingAddress' : 'shippingAddress'
        ],
        [name]: value,
      },
    }));

    if (addressType === 'billing' && customerData.useSameAddress) {
      setCustomerData((prevData) => ({
        ...prevData,
        shippingAddress: {
          ...prevData.billingAddress,
          [name]: value,
        },
      }));
    }

    validateField(name as keyof Address, value, addressType);
  };

  const validateForm = (): boolean => {
    let valid = true;

    Object.entries(customerData).forEach(([key, value]) => {
      if (key === 'billingAddress' || key === 'shippingAddress') {
        Object.entries(value as Address).forEach(
          ([addressKey, addressValue]) => {
            validateField(
              addressKey as keyof Address,
              addressValue as string,
              key as 'billing' | 'shipping'
            );
          }
        );
      } else {
        validateField(key as keyof CustomerData, value as string | boolean);
      }
    });

    Object.values(errors).forEach((error) => {
      if (typeof error === 'object') {
        Object.values(error).forEach((subError) => {
          if (subError) valid = false;
        });
      } else {
        if (error) valid = false;
      }
    });

    return valid;
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    createCustomer(apiRoot, customerData)
      .then((response: CustomerResponse) => {
        console.log('Customer created:', response);
        setErrors({});
        setSuccess(true);
        setToastShown(false);
      })
      .catch((error: CustomError) => {
        console.error('Failed to create customer:', error);

        if (
          error instanceof Error &&
          error.response &&
          error.response.status === 400
        ) {
          setErrors({ email: 'Email already exists' });
        } else {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          const customError = new Error(errorMessage);
          if (customError) {
            showToastMessage(errorMessage, 'error');
          }

          setErrors((prev) => ({
            ...prev,
            submit: customError.message,
          }));

          setServerError(
            'Something went wrong during registration. Please try again later.'
          );
        }
        setErrorToastShown(false);
      });
  };

  const navigate = useNavigate();
  const showToastMessage = (message: string, type: TypeOptions) => {
    if (['info', 'success', 'warning', 'error'].includes(type)) {
      toast[type as 'info' | 'success' | 'warning' | 'error'](message, {
        position: 'top-center',
      });
    } else {
      console.warn(`Invalid toast type: ${type}`);
    }
  };

  useEffect(() => {
    if (success && !toastShown) {
      showToastMessage('Registration Successful!', 'success');
      setToastShown(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    }
  }, [success, toastShown, navigate]);

  useEffect(() => {
    if (serverError && !errorToastShown) {
      showToastMessage(`Registration Failed: ${serverError}`, 'error');
      setErrorToastShown(true);
    }
  }, [serverError, errorToastShown]);

  useEffect(() => {
    if (customerData.useSameAddress) {
      setCustomerData((prevData) => ({
        ...prevData,
        shippingAddress: {
          ...prevData.billingAddress,
        },
      }));
    }
  }, [customerData.useSameAddress]);

  return (
    <div className="register-container">
      <ToastContainer />
      <p className="navigation-link">
        Return to
        <Link to="/">
          <FaHome className="home-icon" /> Home
        </Link>
      </p>
      <section className="registration-section">
        <h1>Sign Up</h1>
        {serverError && (
          <div className="server-error">
            <p>❌ {serverError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <div className="input-container">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Firstname"
                value={customerData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error-input' : 'normal-input'}
                required
              />
              {errors.firstName && (
                <div className="error">
                  <span className="error-icon">⚠️</span> {errors.firstName}
                </div>
              )}
            </div>
            <div className="input-container">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Lastname"
                value={customerData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error-input' : 'normal-input'}
                required
              />
              {errors.lastName && (
                <div className="error">
                  <span className="error-icon">⚠️</span> {errors.lastName}
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <div className="input-container">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={customerData.email}
                onChange={handleChange}
                className={errors.email ? 'error-input' : 'normal-input'}
                required
              />
              {errors.email && (
                <div className="error">
                  <span className="error-icon">⚠️</span> {errors.email}
                </div>
              )}
            </div>
            <Tooltip title={tooltipError} arrow>
              <div className="password-field">
                <PasswordInput
                  password={customerData.password}
                  onPasswordChange={handlePasswordChange}
                  error={errors.password || ''}
                />
              </div>
            </Tooltip>
          </div>
          <div className="form-group">
            <div className="input-container">
              <label htmlFor="countryCode">Country Code:</label>
              <input
                type="text"
                id="countryCode"
                name="countryCode"
                value={customerData.countryCode}
                onChange={handleChange}
                className={errors.countryCode ? 'error-input' : 'normal-input'}
              />
              {errors.countryCode && (
                <div className="error">
                  <span className="error-icon">⚠️</span> {errors.countryCode}
                </div>
              )}
            </div>
            <div className="input-container">
              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={customerData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? 'error-input' : 'normal-input'}
                required
              />
              {errors.dateOfBirth && (
                <div className="error">
                  <span className="error-icon">⚠️</span> {errors.dateOfBirth}
                </div>
              )}
            </div>
          </div>

          <h2>Billing Address</h2>
          <div className="form-group">
            <div className="input-container">
              <label htmlFor="billingCity">City:</label>
              <input
                type="text"
                id="billingCity"
                name="city"
                placeholder="City"
                value={customerData.billingAddress.city}
                onChange={(e) => handleAddressChange(e, 'billing')}
                className={errors.billingAddress?.city ? 'error-input' : ''}
                required
              />
              {errors.billingAddress?.city && (
                <div className="error">
                  <span className="error-icon">⚠️</span>{' '}
                  {errors.billingAddress.city}
                </div>
              )}
            </div>
            <div className="input-container">
              <label htmlFor="billingStreet">Street:</label>
              <input
                type="text"
                id="billingStreet"
                name="street"
                placeholder="Street"
                value={customerData.billingAddress.street}
                onChange={(e) => handleAddressChange(e, 'billing')}
                className={errors.billingAddress?.street ? 'error-input' : ''}
                required
              />
              {errors.billingAddress?.street && (
                <div className="error">
                  <span className="error-icon">⚠️</span>{' '}
                  {errors.billingAddress.street}
                </div>
              )}
            </div>
          </div>
          <div className="input-container">
            <label htmlFor="billingPostalCode">Postal Code:</label>
            <input
              type="text"
              id="billingPostalCode"
              name="postalCode"
              placeholder="Postal Code"
              value={customerData.billingAddress.postalCode}
              onChange={(e) => handleAddressChange(e, 'billing')}
              className={errors.billingAddress?.postalCode ? 'error-input' : ''}
              required
            />
            {errors.billingAddress?.postalCode && (
              <div className="error error-zip">
                <span className="error-icon">⚠️</span>{' '}
                {errors.billingAddress.postalCode}
              </div>
            )}
          </div>

          <div className="input-container">
            <label htmlFor="useSameAddress" className="checkbox-label">
              <input
                type="checkbox"
                id="useSameAddress"
                name="useSameAddress"
                checked={customerData.useSameAddress}
                onChange={handleChange}
              />
              Use same address for billing and shipping
            </label>
          </div>

          {!customerData.useSameAddress && (
            <>
              <h2>Shipping Address</h2>
              <div className="form-group">
                <div className="input-container">
                  <label htmlFor="shippingCity">City:</label>
                  <input
                    type="text"
                    id="shippingCity"
                    name="city"
                    placeholder="City"
                    value={customerData.shippingAddress.city}
                    onChange={(e) => handleAddressChange(e, 'shipping')}
                    className={
                      errors.shippingAddress?.city ? 'error-input' : ''
                    }
                  />
                  {errors.shippingAddress?.city && (
                    <div className="error">
                      <span className="error-icon">⚠️</span>{' '}
                      {errors.shippingAddress.city}
                    </div>
                  )}
                </div>
                <div className="input-container">
                  <label htmlFor="shippingStreet">Street:</label>
                  <input
                    type="text"
                    id="shippingStreet"
                    name="street"
                    placeholder="Street"
                    value={customerData.shippingAddress.street}
                    onChange={(e) => handleAddressChange(e, 'shipping')}
                    className={
                      errors.shippingAddress?.street ? 'error-input' : ''
                    }
                  />
                  {errors.shippingAddress?.street && (
                    <div className="error">
                      <span className="error-icon">⚠️</span>{' '}
                      {errors.shippingAddress.street}
                    </div>
                  )}
                </div>
              </div>
              <div className="input-container">
                <label htmlFor="shippingPostalCode">Postal Code:</label>
                <input
                  type="text"
                  id="shippingPostalCode"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={customerData.shippingAddress.postalCode}
                  onChange={(e) => handleAddressChange(e, 'shipping')}
                  className={
                    errors.shippingAddress?.postalCode ? 'error-input' : ''
                  }
                />
                {errors.shippingAddress?.postalCode && (
                  <div className="error error-zip">
                    <span className="error-icon">⚠️</span>
                    {errors.shippingAddress.postalCode}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="input-container">
            <label htmlFor="setAsDefaultAddress" className="checkbox-label">
              <input
                type="checkbox"
                id="setAsDefaultAddress"
                name="setAsDefaultAddress"
                checked={customerData.setAsDefaultAddress}
                onChange={handleChange}
              />
              Set as default address
            </label>
          </div>
          <div>
            <button type="submit" className="button register-btn">
              Register
            </button>
          </div>
          {errors.submit && (
            <div className="error other-error">
              <p>⚠️ {errors.submit}</p>
            </div>
          )}
          {success && (
            <div className="success-msg">Registration successful!</div>
          )}
        </form>
        <div>
          <p className="navigation-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default RegistrationForm;
