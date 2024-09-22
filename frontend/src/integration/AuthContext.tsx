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

  const logoutUser = async () => {
    const clientId = userManager.settings.client_id;
    const logoutUri = userManager.settings.redirect_uri;
    const cognitoDomain = oidcConfig.cognito_domain;
  
    const logoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}&response_type=code`;
  
    try {
      const response = await fetch(logoutUrl, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (response.ok) {
        console.log('User logged out successfully');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const logout = () => {
    logoutUser();
    localStorage.clear();
    window.location.reload();
    // userManager.clearStaleState().catch((error) => {
    //   console.error('Logout error in clearStaleState:', error);
    // })
    // userManager.signoutRedirect().catch((error) => {
    //   console.error('Logout error in signoutRedirect:', error);
    // });
  };

  console.log("authcontext.provider with user", user)
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};