import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const userId = user?.id || user?._id;

        if (isAuthenticated && userId) {
            const newSocket = io("http://localhost:3000", {
                query: { userId },
                withCredentials: true
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
            };
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};