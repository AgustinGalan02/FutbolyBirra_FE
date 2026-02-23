import { createContext, useContext, useState, useEffect } from "react";
import { RegisterRequest, LoginRequest, VerifyTokenRequest } from "../api/auth";
import Cookies from "js-cookie";
import { set } from "zod";

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
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        async function checkLogin() {
            const cookies = Cookies.get();

            if (!cookies.token) {
                setIsAuthenticated(false);
                setLoading(false);
                return setUser(null);
            }
            try {
                const res = await VerifyTokenRequest(cookies.token);
                if (!res.data) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }

                setIsAuthenticated(true);
                setUser(res.data);
                setLoading(false);

            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
            }
        }
        checkLogin();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                signup,
                signin,
                loading,
                isAuthenticated,
                errors
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
