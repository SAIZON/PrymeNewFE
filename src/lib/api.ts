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
    submitApplication: async (loanType: string, amount: number, tenureMonths: number) => {
        const res = await fetch(`${API_BASE_URL}/dashboard/apply`, {
            method: "POST",
            headers: getAuthHeaders(),
            // Matches ApplicationRequest.java exactly
            body: JSON.stringify({ loanType, amount, tenureMonths }),
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                throw new Error("UNAUTHORIZED");
            }
            throw new Error("Failed to submit application");
        }
        return res.text();
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

    // --- DOCUMENT MODULE ---
    uploadDocument: async (file: File, applicationId: number, documentType: string) => {
        const token = localStorage.getItem("pryme_token");

        // We use FormData to construct the multipart payload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicationId", applicationId.toString());
        formData.append("type", documentType); // e.g., "AADHAAR", "PAN", "SALARY_SLIP"

        const res = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: "POST",
            headers: {
                // 🚨 CRITICAL: Do NOT set "Content-Type" here!
                // The browser will automatically set it to 'multipart/form-data; boundary=...'
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to upload document");
        }

        return res.json(); // Returns LoanDocumentDto
    },

    viewDocument: async (documentId: string) => { // Changed number to string
        const res = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Could not load the document.");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    },

    // --- ADMIN DOCUMENT VERIFICATION ---
    verifyDocument: async (documentId: string, status: "VERIFIED" | "REJECTED", remarks?: string) => { // Changed number to string
        const queryParams = new URLSearchParams({ status });
        if (remarks) queryParams.append("remarks", remarks);

        const res = await fetch(`${API_BASE_URL}/admin/applications/documents/${documentId}/verify?${queryParams.toString()}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to verify document");
        return true;
    },
};