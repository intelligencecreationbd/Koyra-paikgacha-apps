
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHaat from '../components/PublicHaat';

const OnlineHaat: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-5 pb-40 min-h-screen bg-white">
      <PublicHaat onBack={() => navigate('/services')} />
    </div>
  );
};

export default OnlineHaat;
