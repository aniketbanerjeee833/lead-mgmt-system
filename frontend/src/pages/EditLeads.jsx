import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";
import SideMenu from "../layout/SideMenu";
import { useGetLeadByIdQuery, useUpdateLeadMutation } from "../redux/api/userApi";
import { useNavigate, useParams } from "react-router-dom";




import io from "socket.io-client";

const socket = io("http://localhost:5000"); // change to your backend URL

const EditLead = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { role, id: userId } = useSelector((state) => state.user);
  const { data: lead, isLoading } = useGetLeadByIdQuery(leadId);
  const [updateLead] = useUpdateLeadMutation();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (lead) setForm(lead);
  }, [lead]);

  useEffect(() => {
    // Register this user with backend socket
    if (userId && role) {
      socket.emit("register", { id: userId, role });
    }
  }, [userId, role]);

  if (isLoading) return <p>Loading lead...</p>;

  const handleStatusChange = async (value) => {
    const updatedLead = { ...form, Lead_Status: value,admin_id:2 };
    console.log(updatedLead);
    setForm(updatedLead);

    if (value === "Closed") {
      await updateLead({ id: leadId, lead: updatedLead });
      navigate("/home");
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideMenu role={role} />
      <div className="flex-1 p-6">
        <form className="space-y-3">
          <input type="text" value={form.Lead_Name || ""} readOnly className="border p-2 w-full" />
          <input type="text" value={form.Lead_Phone_Number || ""} readOnly className="border p-2 w-full" />
          <input type="text" value={form.Lead_Email_Id || ""} readOnly className="border p-2 w-full" />
          <input type="text" value={form.Company_Name || ""} readOnly className="border p-2 w-full" />

          <label>Status:</label>
          <select
            value={form.Lead_Status || ""}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border p-2"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>
        </form>
      </div>
    </div>
  );
};

export default EditLead;

