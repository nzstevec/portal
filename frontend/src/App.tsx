import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as LoginIcon } from 'bootstrap-icons/icons/box-arrow-in-left.svg';
import { ReactComponent as LogoutIcon } from 'bootstrap-icons/icons/box-arrow-right.svg';

import { AuthProvider, useAuth } from './integration/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// Import page components
import UnAuthenticated from './pages/Unauthenticated';
import UserNotes from './pages/UserNotes';
import About from './pages/About';
import Feedback from './pages/Feedback';
import DocAnalyst from './pages/DocAnalyst';
import Callback from './pages/Callback';
import { FileProvider } from './integration/FileContext';
import DocAudit from './pages/DocAudit';

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
    props.isActive ? '#FFD700' : 'white'};
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

const Tooltip = styled.div`
  visibility: hidden;
  background-color: #333;
  color: blue;
  text-align: center;
  border-radius: 5px;
  padding: 5px 10px;
  position: absolute;
  z-index: 10;
  bottom: 5%; 
  left: -5%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;

  &::after {
    content: '';
    position: absolute;
    top: 100%; /* At the bottom of the tooltip */
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover ${Tooltip} {
    visibility: visible;
    opacity: 1;
  }
`;

const Login = styled(LoginIcon)`
  width: 25px;
  height: 25px;
  padding: 0 40px;
  background-color: #333;
  color: green;
  &:hover {
    color: lightgreen;
  }
`;

const Logout = styled(LogoutIcon)`
  width: 25px;
  height: 25px;
  padding: 0 40px;
  background-color: #333;
  color: #ff0000;
  &:hover {
    color: lightpink;
  }
`;

const Button = styled.button`
  background-color: #333;
  color: white;
  padding: 0;
  border: none;
  border-radius: 4px;
`;

const AppInner: React.FC = () => {
  const { user, login, logout } = useAuth();
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
          <NavItem>
            <NavLink
              to="/doc-audit"
              isActive={location.pathname === '/doc-audit'}
            >
              Doc Audit 𝞫
            </NavLink>
          </NavItem>
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
          <NavItem style={{ marginTop: '-4px' }}>
            <NavLink to="#" isActive={false}>
              {user ? (
                <IconWrapper>
                  <Button onClick={logout}><Logout /></Button>
                  <Tooltip>Logout</Tooltip>
                </IconWrapper>
              ) : (
                <IconWrapper>
                  <Button onClick={login}><Login /></Button>
                  <Tooltip>Login</Tooltip>
                </IconWrapper>
              )}
            </NavLink>
          </NavItem>
        </NavList>
      </Navbar>
      <Content>
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
            <Route
              path="/doc-audit"
              element={
                <ProtectedRoute>
                  <DocAudit />
                </ProtectedRoute>
              }
            />
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
