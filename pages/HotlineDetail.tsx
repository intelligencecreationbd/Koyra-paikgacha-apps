
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicHotline from '../components/PublicHotline';

/**
 * HotlineDetail Page
 * Acts as a route container for the encapsulated PublicHotline component.
 */
const HotlineDetail: React.FC = () => {
  const navigate = useNavigate();
  const { serviceType } = useParams<{ serviceType?: string }>();

  const handleServiceChange = (s: string) => {
    if (!s) navigate('/hotline');
    else navigate(`/hotline/${encodeURIComponent(s)}`);
  };

  return (
    <div className="px-5 pt-1 pb-40 min-h-screen">
      <PublicHotline 
        initialServiceType={serviceType}
        onBack={() => navigate(-1)}
        onServiceChange={handleServiceChange}
      />
    </div>
  );
};

export default HotlineDetail;
