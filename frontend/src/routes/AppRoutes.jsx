import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../pages/admin/components/layout/Layout";
import Table from "../pages/admin/components/pages/Table";
import Login from "../pages/admin/components/auth/LoginForm";
import LayoutProvider from "../pages/admin/components/layout/LayoutProvider";
import View from "../pages/admin/components/pages/action/View";
import { AdminProvider } from "../pages/admin/components/context/AdminContext";
import MSMEAwardApplicationForm from "../pages/frontend/components/pages/MSMEApplicationPage";

const AppRoutes = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);

  return (
    <div>
      <Router>
        <LayoutProvider>
          {/* <AdminProvider> */}
            <View
              {...{ showMemberDialog, setShowMemberDialog, selectedMember }}
            />
            <Routes>
                  {/* Frontend Routes */}
                  <Route path="/" element={<MSMEAwardApplicationForm/>}/>
                   {/* Admin Panel Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route
                  path="/table"
                  element={
                    <Table {...{ setSelectedMember, setShowMemberDialog }} />
                  }
                />
              </Route>
            </Routes>
          {/* </AdminProvider> */}
        </LayoutProvider>
      </Router>
    </div>
  );
};

export default AppRoutes;
