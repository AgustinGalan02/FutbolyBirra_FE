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
            const cookies = Cookies.get(); // obtiene cookies

            if (!cookies.token) { // si no hay token
                setIsAuthenticated(false); // desautenticado
                setLoading(false);
                return setUser(null); // sin usuario
            }
            try {
                const res = await VerifyTokenRequest(cookies.token); // valida token en el backend
                if (!res.data) { // si token no es valido
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }

                setIsAuthenticated(true); // si el token es valido autentica
                setUser(res.data); // guarda info del usuario
                setLoading(false);

            } catch (error) {
                setIsAuthenticated(false); // si hay error, desautentica
                setUser(null); // limpia usuario
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
