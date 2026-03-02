// src/lib/api.ts
const API_BASE_URL = "/api/v1";


const getAuthHeaders = () => {
    const token = localStorage.getItem("pryme_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
};


export const PrymeAPI = {
    // 1. Auth Module
    login: async (email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
    },

    register: async (name: string, email: string, mobile: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Matching exactly what RegisterRequest.java expects
            body: JSON.stringify({ name, email, mobile, password, role: "USER" }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Registration failed");
        }
        return res.json();
    },


  // 2. CRM Module (Admin)

  // 3. Lead Generation (Public)
  submitApplication: async (loanType: string, requestedAmount: number, cibilScore: number) => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanType, requestedAmount, cibilScore }),
    });
    return res.json();
  },

    getDashboardStats: async () => {
        const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        return res.json();
    },

    getUserApplications: async () => {
        const res = await fetch(`${API_BASE_URL}/dashboard/applications`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch applications");
        return res.json(); // Returns List<ApplicationDto>
    },

    // --- ADMIN DASHBOARD ---
    getApplications: async () => {
        const res = await fetch(`${API_BASE_URL}/admin/applications?size=50`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch admin applications");
        return res.json(); // Returns Page<Application>
    },

    updateApplicationStatus: async (id: number, status: string) => {
        const res = await fetch(`${API_BASE_URL}/admin/applications/${id}/status?status=${status}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
    },
};