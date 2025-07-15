import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from '../pages/LoginSignUp';
import CompleteProfile from '../pages/CompleteProfile';
import ForgotPassword from '../pages/ForgotPassword';
import ProfilePage from '../pages/ProfilePage';
import PrivateRoute from './PrivateRoute';
const AppRouter = () => (
  <Router>
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={<LoginSignup/>} />
      <Route path="/complete-profile" element={<PrivateRoute> <CompleteProfile /></PrivateRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<PrivateRoute> <ProfilePage /> </PrivateRoute>} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  </Router>
);

export default AppRouter;
