// src/routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import Home from './components/Home';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/sign-up" element={<SignUpForm />} />
                <Route path="/HomeProfile" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
