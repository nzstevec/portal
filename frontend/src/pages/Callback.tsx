import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../integration/AuthContext';
import UnAuthenticated from './Unauthenticated';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const {
    /* no need to use anything here */
  } = useAuth();

  useEffect(() => {
    // The actual handling is done in AuthContext
    // This component can show a loading state
    navigate('/user-notes');
  }, [navigate]);

  console.log('handling callback');
  return (
    <UnAuthenticated />
  );
};

export default Callback;
