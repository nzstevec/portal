Certainly! Below is a comprehensive example of a **React TypeScript** application that uses the [`oidc-client-ts`](https://github.com/authts/oidc-client-ts) library to manage **OpenID Connect (OIDC)** authentication with **AWS Cognito**. This setup ensures that users are authenticated before accessing protected pages.

## **Overview**

1. **Setup AWS Cognito:**
   - Create a User Pool and App Client.
   - Configure OIDC settings.
   
2. **Initialize React TypeScript App:**
   - Install necessary dependencies.
   - Configure OIDC client.
   
3. **Implement Authentication Flow:**
   - Create an authentication context.
   - Protect routes.
   - Handle login and logout.

4. **Display User Information:**
   - Show the logged-in user's name.

Let's go through each step in detail.

---

## **1. Setup AWS Cognito**

Before diving into the React application, ensure that AWS Cognito is properly configured to handle OIDC authentication.

### **a. Create a User Pool**

1. **Navigate to Cognito in AWS Console:**
   - Sign in to the [AWS Management Console](https://console.aws.amazon.com/).
   - Go to **Cognito** under the **Services** menu.

2. **Create a User Pool:**
   - Click **"Manage User Pools"** and then **"Create a user pool"**.
   - Enter a pool name (e.g., `MyAppUserPool`) and click **"Review defaults"**.
   - Customize settings as needed (e.g., attributes like email, username).
   - Click **"Create pool"**.

### **b. Create an App Client**

1. **Add an App Client:**
   - Within your newly created User Pool, navigate to the **"App clients"** section.
   - Click **"Add an app client"**.
   - Enter an App client name (e.g., `MyAppClient`).
   - **Do NOT** generate a client secret (since it's a browser-based app).
   - Click **"Create app client"**.

2. **Configure App Client Settings:**
   - Navigate to **"App client settings"** under the **"App integration"** tab.
   - **Enabled Identity Providers:** Select **"Cognito User Pool"**.
   - **Callback URL(s):** Enter your frontend application's callback URL (e.g., `http://localhost:3000/callback`).
   - **Sign out URL(s):** Enter your frontend application's sign-out URL (e.g., `http://localhost:3000`).
   - **Allowed OAuth Flows:** Check **"Authorization code"** and **"Implicit"** (if needed).
   - **Allowed OAuth Scopes:** Check **"openid"**, **"profile"**, and **"email"**.
   - Click **"Save changes"**.

### **c. Configure a Domain Name**

1. **Set Up a Domain:**
   - Still under **"App integration"**, click on **"Domain name"**.
   - Choose either **"Use a Cognito domain"** or **"Use your own domain"**.
   - For simplicity, select **"Use a Cognito domain"** and enter a unique domain prefix (e.g., `myappauth`).
   - Click **"Save changes"**.

   Your Cognito hosted UI will be accessible at `https://myappauth.auth.us-east-1.amazoncognito.com`.

---

## **2. Initialize React TypeScript App**

### **a. Create React App with TypeScript**

If you haven't already, create a new React TypeScript application using `create-react-app`:

```bash
npx create-react-app my-app --template typescript
cd my-app
```

### **b. Install Necessary Dependencies**

Install `oidc-client-ts` and `react-router-dom` for handling OIDC authentication and routing:

```bash
npm install oidc-client-ts react-router-dom@6
# or using yarn
yarn add oidc-client-ts react-router-dom@6
```

---

## **3. Implement Authentication Flow**

### **a. Configure OIDC Client**

Create a configuration file for OIDC client settings.

**Create a new file `src/authConfig.ts`:**

```typescript
// src/authConfig.ts
export const oidcConfig = {
  authority: 'https://myappauth.auth.us-east-1.amazoncognito.com', // Replace with your domain
  client_id: 'YOUR_APP_CLIENT_ID', // Replace with your App Client ID
  redirect_uri: 'http://localhost:3000/callback', // Replace with your callback URL
  post_logout_redirect_uri: 'http://localhost:3000', // Replace with your sign-out URL
  response_type: 'code', // Use 'code' for Authorization Code flow
  scope: 'openid profile email', // Define scopes as needed
};
```

**Replace the placeholders:**
- `authority`: Your Cognito hosted UI URL.
- `client_id`: Your App Client ID from Cognito.
- `redirect_uri`: Your application's callback URL.
- `post_logout_redirect_uri`: Your application's sign-out URL.

### **b. Create an Authentication Context**

Create a context to manage authentication state across the app.

**Create a new file `src/AuthContext.tsx`:**

```typescript
// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { oidcConfig } from './authConfig';

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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Explanation:**

- **UserManager Configuration:**
  - Initializes `UserManager` with OIDC settings.
  - Uses `localStorage` to persist user information.

- **Authentication State:**
  - `user`: Holds the authenticated user object or `null`.
  - `login`: Initiates the OIDC sign-in process.
  - `logout`: Initiates the OIDC sign-out process.

- **Callback Handling:**
  - Processes the redirect callback from Cognito after authentication.

### **c. Create Protected Route Component**

Ensure that only authenticated users can access certain routes.

**Create a new file `src/ProtectedRoute.tsx`:**

```typescript
// src/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

**Explanation:**

- **ProtectedRoute:** Wraps around components that require authentication.
- **Redirects:** If the user is not authenticated (`user` is `null`), redirects to the home page (`/`).

### **d. Set Up Routing and Pages**

Implement routing with React Router and create public and protected pages.

**Update `src/App.tsx`:**

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Callback from './pages/Callback';

const NavBar: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>
        Home
      </Link>
      <Link to="/dashboard" style={{ marginRight: '1rem' }}>
        Dashboard
      </Link>
      {user ? (
        <>
          <span style={{ marginRight: '1rem' }}>Hello, {user.profile?.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

**Create the Pages:**

1. **Home Page (`src/pages/Home.tsx`):**

   ```typescript
   // src/pages/Home.tsx
   import React from 'react';

   const Home: React.FC = () => {
     return (
       <div style={{ padding: '2rem' }}>
         <h1>Welcome to My App</h1>
         <p>This is a public home page.</p>
       </div>
     );
   };

   export default Home;
   ```

2. **Dashboard Page (`src/pages/Dashboard.tsx`):**

   ```typescript
   // src/pages/Dashboard.tsx
   import React from 'react';

   const Dashboard: React.FC = () => {
     return (
       <div style={{ padding: '2rem' }}>
         <h1>Dashboard</h1>
         <p>This is a protected dashboard page. Only authenticated users can see this.</p>
       </div>
     );
   };

   export default Dashboard;
   ```

3. **Callback Page (`src/pages/Callback.tsx`):**

   ```typescript
   // src/pages/Callback.tsx
   import React, { useEffect } from 'react';
   import { useAuth } from '../AuthContext';

   const Callback: React.FC = () => {
     const { /* no need to use anything here */ } = useAuth();

     useEffect(() => {
       // The actual handling is done in AuthContext
       // This component can show a loading state
     }, []);

     return (
       <div style={{ padding: '2rem' }}>
         <h1>Processing authentication...</h1>
       </div>
     );
   };

   export default Callback;
   ```

**Explanation:**

- **NavBar:** Displays navigation links and login/logout buttons based on authentication state.
- **Home:** A public page accessible to all users.
- **Dashboard:** A protected page that requires authentication.
- **Callback:** Handles the redirect after successful authentication.

### **e. Update `src/index.tsx`**

Ensure that your React application is properly rendered.

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## **4. Display User Information**

The `NavBar` component already displays the logged-in user's email if authenticated. You can further customize this to show more user details as needed.

---

## **Complete File Structure**

Here's how your project's file structure should look:

```
my-app/
├── node_modules/
├── public/
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   └── Callback.tsx
│   ├── AuthContext.tsx
│   ├── ProtectedRoute.tsx
│   ├── authConfig.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── ...other files
├── package.json
├── tsconfig.json
└── ...other files
```

---

## **5. Running the Application**

1. **Start the React App:**

   ```bash
   npm start
   # or
   yarn start
   ```

2. **Navigate to Your App:**

   Open your browser and go to `http://localhost:3000`. You should see the Home page with a "Login" button.

3. **Authenticate:**

   - Click the **"Login"** button.
   - You will be redirected to the Cognito hosted UI.
   - Enter your credentials and sign in.
   - After successful authentication, you will be redirected back to the Home page, and the NavBar will display your email with a "Logout" button.

4. **Access Protected Route:**

   - Click on **"Dashboard"** in the NavBar.
   - If authenticated, you will see the Dashboard page.
   - If not authenticated, you will be redirected to the Home page.

5. **Logout:**

   - Click the **"Logout"** button.
   - You will be signed out and redirected to the Home page.

---

## **6. Additional Considerations**

### **a. Secure Token Storage**

While `oidc-client-ts` manages token storage using `localStorage` by default, be aware of security implications:

- **XSS Vulnerabilities:** Storing tokens in `localStorage` can expose them to XSS attacks.
- **Alternative Storage:** Consider using `sessionStorage` or in-memory storage for better security.
- **Refresh Tokens:** Implement refresh token handling to maintain user sessions without exposing long-lived tokens.

### **b. Handling Token Expiration**

Implement mechanisms to handle token expiration gracefully:

- **Silent Renew:** Use `silent_redirect_uri` to renew tokens without user interaction.
- **Error Handling:** Detect token expiration and prompt users to re-authenticate if necessary.

**Update `oidcConfig` in `src/authConfig.ts`:**

```typescript
// src/authConfig.ts
export const oidcConfig = {
  authority: 'https://myappauth.auth.us-east-1.amazoncognito.com', // Replace with your domain
  client_id: 'YOUR_APP_CLIENT_ID', // Replace with your App Client ID
  redirect_uri: 'http://localhost:3000/callback', // Replace with your callback URL
  post_logout_redirect_uri: 'http://localhost:3000', // Replace with your sign-out URL
  response_type: 'code', // Use 'code' for Authorization Code flow
  scope: 'openid profile email', // Define scopes as needed
  silent_redirect_uri: 'http://localhost:3000/silent-renew', // Add a silent renew page
  automaticSilentRenew: true,
};
```

**Create `src/pages/SilentRenew.tsx`:**

```typescript
// src/pages/SilentRenew.tsx
import React, { useEffect } from 'react';
import { UserManager } from 'oidc-client-ts';
import { oidcConfig } from '../authConfig';

const userManager = new UserManager({
  ...oidcConfig,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

const SilentRenew: React.FC = () => {
  useEffect(() => {
    userManager.signinSilentCallback().catch((error) => {
      console.error('Silent renew error:', error);
    });
  }, []);

  return <div>Loading...</div>;
};

export default SilentRenew;
```

**Update `src/App.tsx` Routes:**

```typescript
// src/App.tsx
import SilentRenew from './pages/SilentRenew';

// ... inside <Routes>
<Route path="/silent-renew" element={<SilentRenew />} />
```

**Explanation:**

- **Silent Renew:** A hidden iframe page that handles silent token renewal.
- **Automatic Silent Renew:** Configured via `automaticSilentRenew: true` in `oidcConfig`.

### **c. Protect API Routes on Backend**

Ensure that your Flask backend validates the JWT tokens received from the frontend to protect API endpoints.

**Sample Flask Backend Setup:**

1. **Install Required Libraries:**

   ```bash
   pip install Flask flask-cors PyJWT requests
   ```

2. **Create `app.py`:**

   ```python
   # app.py
   from flask import Flask, jsonify, request
   from flask_cors import CORS
   import jwt
   import requests
   import json
   from functools import wraps

   app = Flask(__name__)
   CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Replace with your frontend URL

   # Configuration
   COGNITO_REGION = 'us-east-1'  # Replace with your region
   COGNITO_USERPOOL_ID = 'us-east-1_XXXXXXXXX'  # Replace with your User Pool ID
   COGNITO_APP_CLIENT_ID = 'XXXXXXXXXXXXXXXXXXXXXXXXXX'  # Replace with your App Client ID
   COGNITO_JWKS_URL = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json'

   # Fetch JWKS
   jwks_response = requests.get(COGNITO_JWKS_URL)
   jwks = jwks_response.json()

   public_keys = {}
   for key in jwks['keys']:
       kid = key['kid']
       public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))

   def token_required(f):
       @wraps(f)
       def decorated(*args, **kwargs):
           token = None
           # JWT is passed in the request header
           if 'Authorization' in request.headers:
               auth_header = request.headers['Authorization']
               parts = auth_header.split()
               if len(parts) == 2 and parts[0] == 'Bearer':
                   token = parts[1]

           if not token:
               return jsonify({'message': 'Token is missing!'}), 401

           try:
               # Decode JWT to get kid
               unverified_header = jwt.get_unverified_header(token)
               kid = unverified_header['kid']
               key = public_keys.get(kid)

               if not key:
                   return jsonify({'message': 'Invalid token key!'}), 401

               # Decode and verify token
               decoded = jwt.decode(
                   token,
                   key,
                   algorithms=['RS256'],
                   audience=COGNITO_APP_CLIENT_ID,
                   issuer=f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}'
               )
               request.user = decoded  # Attach user info to request
           except jwt.ExpiredSignatureError:
               return jsonify({'message': 'Token has expired!'}), 401
           except jwt.InvalidTokenError:
               return jsonify({'message': 'Invalid token!'}), 401

           return f(*args, **kwargs)
       return decorated

   # Protected route example
   @app.route('/api/protected', methods=['GET'])
   @token_required
   def protected():
       user = request.user
       return jsonify({
           'message': 'This is a protected endpoint.',
           'user': {
               'username': user.get('cognito:username'),
               'email': user.get('email')
           }
       }), 200

   if __name__ == '__main__':
       app.run(debug=True)
   ```

**Explanation:**

- **CORS Configuration:** Allows requests from `http://localhost:3000`.
- **JWKS Fetching:** Retrieves JSON Web Key Set from Cognito to verify JWT signatures.
- **Token Validation Decorator (`token_required`):** Validates the incoming JWT token.
- **Protected API Endpoint (`/api/protected`):** Only accessible with a valid token.

---

## **6. Testing the Application**

1. **Start the Flask Backend:**

   ```bash
   python app.py
   ```

   The backend should be running at `http://localhost:5000`.

2. **Start the React App:**

   ```bash
   npm start
   # or
   yarn start
   ```

   The frontend should be running at `http://localhost:3000`.

3. **Authenticate and Access Protected Route:**

   - **Home Page:** Accessible to all users.
   - **Login:**
     - Click the **"Login"** button in the NavBar.
     - You will be redirected to the Cognito hosted UI.
     - Enter your credentials and sign in.
     - After successful login, you'll be redirected back to the Home page with your email displayed.
   - **Dashboard:**
     - Click the **"Dashboard"** link.
     - If authenticated, you will access the protected Dashboard page.
     - If not authenticated, you will be redirected to the Home page.

4. **API Call to Protected Endpoint:**

   **Create a new file `src/components/ProtectedData.tsx`:**

   ```typescript
   // src/components/ProtectedData.tsx
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';
   import { useAuth } from '../AuthContext';

   const ProtectedData: React.FC = () => {
     const [data, setData] = useState<any>(null);
     const { user } = useAuth();

     useEffect(() => {
       const fetchData = async () => {
         if (user) {
           const accessToken = user.access_token; // Adjust based on your token structure
           try {
             const response = await axios.get('http://localhost:5000/api/protected', {
               headers: {
                 Authorization: `Bearer ${accessToken}`,
               },
             });
             setData(response.data);
           } catch (error) {
             console.error('Error fetching protected data:', error);
           }
         }
       };

       fetchData();
     }, [user]);

     return (
       <div>
         {data ? (
           <pre>{JSON.stringify(data, null, 2)}</pre>
         ) : (
           <p>Loading protected data...</p>
         )}
       </div>
     );
   };

   export default ProtectedData;
   ```

   **Use `ProtectedData` in `Dashboard.tsx`:**

   ```typescript
   // src/pages/Dashboard.tsx
   import React from 'react';
   import ProtectedData from '../components/ProtectedData';

   const Dashboard: React.FC = () => {
     return (
       <div style={{ padding: '2rem' }}>
         <h1>Dashboard</h1>
         <p>This is a protected dashboard page. Only authenticated users can see this.</p>
         <ProtectedData />
       </div>
     );
   };

   export default Dashboard;
   ```

   **Explanation:**

   - **ProtectedData:** Fetches data from the protected backend API using the Access Token.
   - **Dashboard:** Displays the protected data.

---

## **7. Complete Code Snippets**

For clarity, here's the complete code for each file mentioned above.

### **a. `src/authConfig.ts`**

```typescript
// src/authConfig.ts
export const oidcConfig = {
  authority: 'https://myappauth.auth.us-east-1.amazoncognito.com', // Replace with your domain
  client_id: 'YOUR_APP_CLIENT_ID', // Replace with your App Client ID
  redirect_uri: 'http://localhost:3000/callback', // Replace with your callback URL
  post_logout_redirect_uri: 'http://localhost:3000', // Replace with your sign-out URL
  response_type: 'code', // Use 'code' for Authorization Code flow
  scope: 'openid profile email', // Define scopes as needed
  silent_redirect_uri: 'http://localhost:3000/silent-renew', // Add a silent renew page
  automaticSilentRenew: true,
};
```

### **b. `src/AuthContext.tsx`**

```typescript
// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { oidcConfig } from './authConfig';

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

    // Listen for user loaded and unloaded events
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **c. `src/ProtectedRoute.tsx`**

```typescript
// src/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### **d. `src/App.tsx`**

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Callback from './pages/Callback';
import SilentRenew from './pages/SilentRenew';

const NavBar: React.FC = () => {
  const { user, login, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>
        Home
      </Link>
      <Link to="/dashboard" style={{ marginRight: '1rem' }}>
        Dashboard
      </Link>
      {user ? (
        <>
          <span style={{ marginRight: '1rem' }}>Hello, {user.profile?.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/callback" element={<Callback />} />
          <Route path="/silent-renew" element={<SilentRenew />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

### **e. `src/pages/Home.tsx`**

```typescript
// src/pages/Home.tsx
import React from 'react';

const Home: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to My App</h1>
      <p>This is a public home page.</p>
    </div>
  );
};

export default Home;
```

### **f. `src/pages/Dashboard.tsx`**

```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import ProtectedData from '../components/ProtectedData';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>This is a protected dashboard page. Only authenticated users can see this.</p>
      <ProtectedData />
    </div>
  );
};

export default Dashboard;
```

### **g. `src/pages/Callback.tsx`**

```typescript
// src/pages/Callback.tsx
import React from 'react';

const Callback: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Processing authentication...</h1>
    </div>
  );
};

export default Callback;
```

### **h. `src/pages/SilentRenew.tsx`**

```typescript
// src/pages/SilentRenew.tsx
import React, { useEffect } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { oidcConfig } from '../authConfig';

const userManager = new UserManager({
  ...oidcConfig,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

const SilentRenew: React.FC = () => {
  useEffect(() => {
    userManager
      .signinSilentCallback()
      .then(() => {
        console.log('Silent renew success');
      })
      .catch((error) => {
        console.error('Silent renew error:', error);
      });
  }, []);

  return <div>Loading...</div>;
};

export default SilentRenew;
```

### **i. `src/components/ProtectedData.tsx`**

```typescript
// src/components/ProtectedData.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const ProtectedData: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const accessToken = user.access_token; // Adjust based on your token structure
        try {
          const response = await axios.get('http://localhost:5000/api/protected', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setData(response.data);
        } catch (error) {
          console.error('Error fetching protected data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  return (
    <div>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading protected data...</p>
      )}
    </div>
  );
};

export default ProtectedData;
```

---

## **8. Final Notes**

### **a. Silent Renew Implementation**

The `SilentRenew` component handles silent token renewal using an iframe. Ensure that the `silent_redirect_uri` is correctly set in your `oidcConfig` and that the corresponding route (`/silent-renew`) is correctly configured.

### **b. Backend CORS Configuration**

Ensure that your Flask backend's CORS settings allow requests from your frontend's origin (`http://localhost:3000`):

```python
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
```

### **c. Security Considerations**

- **HTTPS:** Always use HTTPS in production to secure data in transit.
- **Token Storage:** Be cautious about where you store tokens. Avoid storing sensitive tokens in `localStorage` to mitigate XSS risks.
- **Environment Variables:** Protect your configuration files and never expose sensitive information in your codebase.

### **d. Handling Errors and Edge Cases**

Implement comprehensive error handling to manage scenarios like failed token renewals, network issues, or unauthorized access attempts.

---

## **Conclusion**

This example demonstrates how to set up a React TypeScript application with `oidc-client-ts` for managing OIDC authentication with AWS Cognito. By following the steps outlined above, you can ensure that users are authenticated before accessing protected pages, securely handle tokens, and maintain a seamless user experience.

Feel free to customize and extend this setup based on your application's specific requirements. If you encounter any issues or need further assistance, don't hesitate to ask!