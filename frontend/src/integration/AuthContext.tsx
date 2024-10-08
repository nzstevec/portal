import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { oidcConf, oidcConfigLocal } from './config';

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

// const oidcConfig = oidcConfigLocal; // to test locally you need to uncomment this and comment out the next line
const oidcConfig = oidcConf;
const issuer = oidcConfig.authority;
const jwks = `${oidcConfig.authority}/.well-known/jwks.json`;
const clientId = oidcConfig.client_id;
const redirectUri = oidcConfig.redirect_uri;
const logoutUri = oidcConfig.post_logout_redirect_uri;
const cognitoDomain = oidcConfig.cognito_domain;
const authorizationEndpoint = `${cognitoDomain}/oauth2/authorize`;
const tokenEndpoint = `${cognitoDomain}/oauth2/token`;
const userinfoEndpoint = `${cognitoDomain}/oauth2/userInfo`;
const endSessionEndpoint = `${cognitoDomain}/logout`;

const userManager = new UserManager({
  ...oidcConfig,
  metadata: {
    authorization_endpoint: authorizationEndpoint,
    end_session_endpoint: endSessionEndpoint,
    issuer: issuer,
    jwks_uri: jwks,
    token_endpoint: tokenEndpoint,
    userinfo_endpoint: userinfoEndpoint,
  },
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

    // Handle logout event from other tabs
    const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === 'logout') {
          userManager.removeUser().then(() => setUser(null));
        }
      };
  
      window.addEventListener('storage', handleStorageEvent);

    // Handle callback redirects
    const handleCallback = async () => {
      if (window.location.pathname === '/callback') {
        try {
          console.log("actually handling callback")
          const user = await userManager.signinRedirectCallback();
          setUser(user);
          window.history.replaceState({}, document.title, '/');
        } catch (error) {
          console.error('Callback error:', error);
        }
      }
    };

    console.log("calling handling callback from provider init")
    handleCallback();

    // Cleanup event listeners on unmount
    return () => {
      userManager.events.removeUserLoaded(setUser);
      userManager.events.removeUserUnloaded(() => setUser(null));
    };
  }, []);

  const login = () => {
    console.log("login user")
    userManager.signinRedirect()
    .catch((error) => {
      console.error('Login error:', error);
    });
    console.log("logged in")
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
        // Notify other tabs about logout
        localStorage.setItem('logout', Date.now().toString());
        localStorage.removeItem('logout');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const logout = () => {
    const clientId = oidcConfig.client_id;
    const logoutUri = oidcConfig.post_logout_redirect_uri;
    console.log("signout redirect");
    userManager.signoutRedirect({
        extraQueryParams: {
            client_id: clientId,
            logout_uri: logoutUri
        }
    })
    .catch((error) => {
      console.error('Logout error in signoutRedirect:', error);
    });
    console.log("logged out")
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};