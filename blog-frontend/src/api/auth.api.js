import api from "./axios";

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response) {
    // Backend returned an error response
    const { data, status } = error.response;
    
    // Try different possible error message locations
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return typeof data.error === 'string' ? data.error : data.error.message || 'An error occurred';
    }
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
    if (data?.errors && typeof data.errors === 'string') {
      return data.errors;
    }
    
    // Default messages based on status code
    if (status === 401) {
      return "Unauthorized. Please check your credentials.";
    }
    if (status === 404) {
      return "Resource not found.";
    }
    if (status === 500) {
      return "Server error. Please try again later.";
    }
    
    return error.response.statusText || "An error occurred";
  } else if (error.request) {
    // Request was made but no response received
    return "Network error. Please check your connection and try again.";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred";
  }
};

// Login API
export const loginAPI = async (data) => {
  try {
    const response = await api.post("/v1/auth/login", data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Signup API
export const signupAPI = async (data) => {
  try {
    const response = await api.post("/v1/auth/sign-up", data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Get Me API
export const getMeApi = async () => {
  try {
    const res = await api.get("/v1/auth/me");
    return res.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

// Logout API
export const logoutAPI = async () => {
  try {
    const response = await api.get("/v1/auth/log-out");
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
};

