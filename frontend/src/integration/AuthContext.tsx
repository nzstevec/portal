import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { oidcConfig } from './oidc.config';

interface AuthContextProps {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const userManager = new UserManager({
  ...oidcConfig,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from storage
    userManager.getUser().then(setUser);

    // Listen for user loaded events
    userManager.events.addUserLoaded(setUser);
    userManager.events.addUserUnloaded(() => setUser(null));

    // Handle callback redirects
    const handleCallback = async () => {
      if (window.location.pathname === '/callback') {
        try {
          const user = await userManager.signinRedirectCallback();
          setUser(user);
          window.history.replaceState({}, document.title, '/');
        } catch (error) {
          console.error('Callback error:', error);
        }
      }
    };

    console.log("handling callback")
    handleCallback();

    // Cleanup event listeners on unmount
    return () => {
      userManager.events.removeUserLoaded(setUser);
      userManager.events.removeUserUnloaded(() => setUser(null));
    };
  }, []);

  const login = () => {
    userManager.signinRedirect().catch((error) => {
      console.error('Login error:', error);
    });
  };

  const logout = () => {
    userManager.signoutRedirect().catch((error) => {
      console.error('Logout error:', error);
    });
  };

  console.log("authcontext.provider with user", user)
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};