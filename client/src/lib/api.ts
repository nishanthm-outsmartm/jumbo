const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = {
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send reset email");
    }

    return data;
  },

  verifyResetToken: async (token: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/verify-reset-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Invalid reset token");
    }

    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    return data;
  },
};
