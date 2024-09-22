import React, { useEffect } from 'react';
import { useAuth } from '../integration/AuthContext';

const Callback: React.FC = () => {
  const { /* no need to use anything here */ } = useAuth();

  useEffect(() => {
    // The actual handling is done in AuthContext
    // This component can show a loading state
  }, []);

  console.log("handling callback")
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Processing authentication...</h1>
    </div>
  );
};

export default Callback;