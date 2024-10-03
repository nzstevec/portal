import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';

import { AuthProvider, useAuth } from './integration/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// Import page components
import UnAuthenticated from './pages/Unauthenticated';
import UserNotes from './pages/UserNotes';
import About from './pages/About';
// import Services from './pages/Services';
// import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import DocAnalyst from './pages/DocAnalyst';
import Callback from './pages/Callback';
import { FileProvider } from './integration/FileContext';

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
`;

const Navbar = styled.nav`
  position: fixed;
  left: 230px;
  overflow: hidden;
  text-align: center;
  font-size: small;
  height: 12px;
  width: 90vw;
  background-color: #333;
  padding: 5px 10px 10px 10px;
`;

const NavList = styled.ul`
  list-style-type: none;
  display: flex;
  justify-content: space-around;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

interface NavLinkProps {
  isActive: boolean;
}

const NavLink = styled(Link)<NavLinkProps>`
  color: ${(props) =>
    props.isActive ? '#FFD700' : 'white'}; /* Highlight active link */
  font-size-adjust: ${(props) =>
    props.isActive ? '.7' : '.6'};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  width: 10vw;
  min-width: 150px;
  height: 100vh;
  /* border-right: 1px solid #ccc; */
  background-color: #f0f0f0;
  padding: 20px;
  background-image: url('scoti_logo.gif');
  background-repeat: no-repeat;
  background-position: top -20px right 50%;
  background-size: 50%;
`;

const StatusBar = styled.footer`
  position: fixed;
  bottom: 0;
  text-align: center;
  font-size: small;
  width: 100%;
  height: 10px;
  background-color: #333;
  color: white;
  padding: 10px;
  text-align: center;
`;

const AppInner: React.FC = () => {
  const { user, login, logout } = useAuth();
  // console.log('user = ', user);
  const location = useLocation();
  return (
    <AppContainer>
      <Navbar>
        <NavList>
          <NavItem>
            <NavLink
              to="/user-notes"
              isActive={location.pathname === '/user-notes'}
            >
              User Notes
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              to="/doc-analyst"
              isActive={location.pathname === '/doc-analyst'}
            >
              Doc Analyst 𝞫
            </NavLink>
          </NavItem>
          {/* <NavItem>
              <NavLink to="/services" isActive={location.pathname === '/services'}>Services</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/contact" isActive={location.pathname === '/contact'}>Contact</NavLink>
            </NavItem> */}
          <NavItem>
            <NavLink to="/about" isActive={location.pathname === '/about'}>
              About
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              to="/feedback"
              isActive={location.pathname === '/feedback'}
            >
              Feedback
            </NavLink>
          </NavItem>
          <NavItem style={{ marginTop: '-2px' }}>
            <NavLink to="#" isActive={false}>
              {user ? (
                <button onClick={logout}>Logout</button>
              ) : (
                <button onClick={login}>Login</button>
              )}
            </NavLink>
          </NavItem>
        </NavList>
      </Navbar>
      <Content>
        {/* <Sidebar /> */}
        {location.pathname !== '/doc-analyst' && <Sidebar />}
        <MainContent>
          <Routes>
            <Route path="/" element={<UnAuthenticated />} />
            <Route
              path="/user-notes"
              element={
                <ProtectedRoute>
                  <UserNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doc-analyst"
              element={
                <ProtectedRoute>
                  <DocAnalyst />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/services" element={<Services authenticated={isAuthenticated}/>} />
              <Route path="/contact" element={<Contact authenticated={isAuthenticated}/>} /> */}
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route path="/callback" element={<Callback />} />
            <Route path="/logout" element={<UnAuthenticated />} />
            {/* <Route
              path="/callback"
              element={
                <ProtectedRoute>
                  <UserNotes />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
        </MainContent>
      </Content>
      <StatusBar>
        {user ? (
          <>
            <span>{user.profile?.name} logged in | © 2024 SCOTi Sandbox</span>
          </>
        ) : (
          <span>
            You are not authenticated - Log In first | © 2024 SCOTi Sandbox
          </span>
        )}
      </StatusBar>
    </AppContainer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FileProvider>
        <Router>
          <AppInner />
        </Router>
      </FileProvider>
    </AuthProvider>
  );
};

export default App;
