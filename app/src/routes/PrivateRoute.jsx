import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token, authReady } = useContext(AuthContext);

  if (!authReady) return null; // or return <Loader />

  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;



// This ensures users can’t access certain routes unless they’re authenticated.