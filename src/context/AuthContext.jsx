import { createContext, useContext, useState, useEffect } from "react";
import { RegisterRequest, LoginRequest } from "../api/auth";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe estar dentro de un AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);

    const signup = async (values) => {
        try {
            const res = await RegisterRequest(values);
            console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            const serverErrors = error.response?.data;
            console.log(error.response);
            setErrors(Array.isArray(serverErrors) ? serverErrors : [serverErrors]);
        }
    }

    const signin = async (values) => {
        try {
            const res = await LoginRequest(values);
            console.log(res);
            setUser(res.data);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            console.error(error);
            const serverErrors = error.response.data;

            if (Array.isArray(serverErrors)) {
                setErrors(serverErrors);
            } else {
                setErrors([serverErrors]);
            }
        }
    }



    useEffect(() => {
        if (errors && errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [errors]);

    return (
        <AuthContext.Provider
            value={{
                user,
                signup,
                signin,
                isAuthenticated,
                errors
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
