
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicWeather from '../components/PublicWeather';

/**
 * WeatherPage Container
 * Acts as a route entry for the encapsulated PublicWeather component.
 * Fixed height container to enable internal scrolling.
 */
const WeatherPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-1 h-[calc(100vh-80px)]">
      <PublicWeather onBack={() => navigate(-1)} />
    </div>
  );
};

export default WeatherPage;
