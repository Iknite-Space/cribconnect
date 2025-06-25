import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from '../pages/LoginSignUp';
import CompleteProfile from '../pages/CompleteProfile';

const AppRouter = () => (
  <Router>
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={<LoginSignup/>} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  </Router>
);

export default AppRouter;
