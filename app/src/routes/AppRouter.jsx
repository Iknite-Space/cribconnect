import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from '../pages/LoginSignUp';
import CompleteProfile from '../pages/CompleteProfile';
import ForgotPassword from '../pages/ForgotPassword';
import ProfilePage from '../pages/ProfilePage';
import PrivateRoute from './PrivateRoute';
import HomePage from '../pages/HomePage';
import Dashboard from '../pages/Dashboard';
import MessagePage from '../pages/MessagePage';
import SettingsPage from '../pages/SettingsPage';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
const AppRouter = () => (

   <ThemeProvider>
    <LanguageProvider>
  <Router>
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/h" element={ <HomePage/>} />
      <Route path="/login" element={<LoginSignup/>} />
      <Route path="/complete-profile" element={<PrivateRoute> <CompleteProfile /></PrivateRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<PrivateRoute> <ProfilePage /> </PrivateRoute>} />
      <Route path="/" element={<MessagePage /> } />
      <Route path="/dashboard" element={<PrivateRoute> <Dashboard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute> <SettingsPage /></PrivateRoute>} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
    
  </Router>
   </LanguageProvider>
  </ThemeProvider>
);

export default AppRouter;
