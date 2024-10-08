import React, { useEffect } from 'react';
import { useAuth } from '../integration/AuthContext';
import UnAuthenticated from './Unauthenticated';

const Callback: React.FC = () => {
  const {
    /* no need to use anything here */
  } = useAuth();

  useEffect(() => {
    // The actual handling is done in AuthContext
    // This component can show a loading state
  }, []);

  console.log('handling callback');
  return (
    <UnAuthenticated />
  );
};

export default Callback;
