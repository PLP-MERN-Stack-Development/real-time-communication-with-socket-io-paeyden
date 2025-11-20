import { createContext, useContext } from "react";
import { useSocket } from "../socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketData = useSocket();
  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
