import { createContext, useContext, useState, useEffect } from "react";
import { RegisterRequest, LoginRequest, VerifyTokenRequest, LogoutRequest } from "../api/auth";
import Cookies from "js-cookie";


export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) { // valida que esté dentro del provider
        throw new Error("useAuth debe estar dentro de un AuthProvider");
    }
    return context;
};

// Provider para entrar a la pagina (registrarse y/o logearse)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    // REGISTER
    const signup = async (values) => {
        try {
            const res = await RegisterRequest(values); // envia datos a backend
            setUser(res.data);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            const serverErrors = error.response?.data;
            setErrors(Array.isArray(serverErrors) ? serverErrors : [serverErrors]); // setea errores
        }
    }

    // LOGIN
    const signin = async (values) => {
        try {
            const res = await LoginRequest(values); // envia credenciales
            setUser(res.data);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            const serverErrors = error.response.data;
            if (Array.isArray(serverErrors)) {
                setErrors(serverErrors);
            } else {
                setErrors([serverErrors]); // convierte a array
            }
        }
    }

    // Función de logout
    const logout = async () => {
        try {
            await LogoutRequest();
            Cookies.remove('token');
            setIsAuthenticated(false);
            setUser(null);
            setErrors([]);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "No se pudo cerrar sesión. Intentá de nuevo.";
            setErrors([errorMessage]);
        }
    };

    // Limpiar errores despues de 5 segundos
    useEffect(() => {
        if (errors && errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Verificar si el usuario tiene sesión activa al cargar 
    useEffect(() => {
        async function checkLogin() {
            try {
                // Le pedimos al backend que verifique la cookie que viaja sola
                const res = await VerifyTokenRequest();

                if (!res.data) {
                    setIsAuthenticated(false);
                    setUser(null);
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
                logout,
                loading,
                isAuthenticated,
                errors
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
