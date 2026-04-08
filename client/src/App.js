import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, RequireAuth } from './components';
import {
  DashboardPage,
  CompaniesPage,
  ContactsPage,
  LeadsPage,
  AddCompanyPage,
  EditCompanyPage,
  AddContactPage,
  EditContactPage,
  AddLeadPage,
  EditLeadPage,
  LoginPage,
  RegisterPage,
} from './pages';
import { setUnauthorizedHandler } from './services/api';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<AddCompanyPage />} />
          <Route path="companies/:id/edit" element={<EditCompanyPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/new" element={<AddContactPage />} />
          <Route path="contacts/:id/edit" element={<EditContactPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/new" element={<AddLeadPage />} />
          <Route path="leads/:id/edit" element={<EditLeadPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
