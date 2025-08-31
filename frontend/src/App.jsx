import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRole, setUserId } from "./redux/reducer/userReducer";
import Admindashboard from "./pages/Admindashboard";
import AllLeads from "./pages/AllLeads";
import Login from "./pages/Login";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import EditLead from "./pages/EditLeads";
import AdminNotifications from "./pages/AdminNotifications";

export default function App() {
  const { userId, role } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // ✅ Restore state from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedRole = localStorage.getItem("role");
    if (savedUserId) {
      dispatch(setUserId(parseInt(savedUserId)));
      dispatch(setRole(savedRole));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {userId !== null && role === "user" && (
          <Route path="/home" element={<AllLeads />} />
        )}
        {userId !== null && role === "admin" && (
          <Route path="/admin-home" element={<Admindashboard />} />
        )}
        <Route path={`/edit-leads/:leadId`} element={<EditLead/>} />
        <Route path="/" element={<Login />} />
        <Route path="/admin-notifications" element={<AdminNotifications/>} />
      </Routes>
    </BrowserRouter>
  );
}
