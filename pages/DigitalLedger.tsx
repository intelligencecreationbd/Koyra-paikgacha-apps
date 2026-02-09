
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User } from '../types';
import PublicLedger from '../components/PublicLedger';

const DigitalLedger: React.FC = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  if (!loggedInUser) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="p-5 min-h-screen">
      <PublicLedger 
        user={loggedInUser} 
        onBack={() => navigate('/services')} 
      />
    </div>
  );
};

export default DigitalLedger;
