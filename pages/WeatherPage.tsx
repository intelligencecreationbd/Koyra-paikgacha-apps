
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicWeather from '../components/PublicWeather';

/**
 * WeatherPage Container
 * Acts as a route entry for the encapsulated PublicWeather component.
 */
const WeatherPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-5 pb-40 min-h-screen">
      <PublicWeather onBack={() => navigate(-1)} />
    </div>
  );
};

export default WeatherPage;
