// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PrymeAPI } from "@/lib/api";

type AppRole = "admin" | "user";

interface AuthContextType {
    user: any | null;
    role: AppRole | null;
    isLoading: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<AppRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check localStorage on mount for Spring Boot JWT
    useEffect(() => {
        const token = localStorage.getItem("pryme_token");
        const savedRole = localStorage.getItem("pryme_role") as AppRole;
        const savedName = localStorage.getItem("pryme_name");

        if (token) {
            setUser({ name: savedName, token });
            setRole(savedRole?.toLowerCase() as AppRole || "user");
        }
        setIsLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const response = await PrymeAPI.login(email, password);

            localStorage.setItem("pryme_token", response.token);
            localStorage.setItem("pryme_role", response.role || "USER");
            localStorage.setItem("pryme_name", response.name || "User");

            setUser({ name: response.name, token: response.token });
            setRole(response.role?.toLowerCase() as AppRole || "user");

            return { error: null };
        } catch (error: any) {
            return { error: new Error(error.message) };
        }
    };

    const signOut = () => {
        localStorage.removeItem("pryme_token");
        localStorage.removeItem("pryme_role");
        localStorage.removeItem("pryme_name");
        setUser(null);
        setRole(null);
    };

    const value: AuthContextType = {
        user,
        role,
        isLoading,
        isAdmin: role === "admin",
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};