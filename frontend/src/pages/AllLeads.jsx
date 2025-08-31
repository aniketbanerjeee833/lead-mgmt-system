// import React from 'react'
// import SideMenu from '../layout/SideMenu'
// import { useSelector } from 'react-redux';

// export default function AllLeads() {
//       const {setRole,userId}=useSelector(state=>state.user);
//   return (
//     <div className='grid grid-cols-2'>
//         <div>
//             <SideMenu role='user' />
//         </div>
      
//     </div>
//   )
// }

import React, { useEffect, useState } from "react";
import SideMenu from "../layout/SideMenu";
import { useDispatch, useSelector } from "react-redux";

import { useGetAllLeadsQuery } from "../redux/api/userApi";
import { setLeadId } from "../redux/reducer/userReducer";
import { useNavigate } from "react-router-dom";

export default function AllLeads() {
    const navigate=useNavigate();
    const dispatch = useDispatch();
  const { role, userId } = useSelector((state) => state.user); // ✅ get role + userId from redux


  // Fetch all leads for this user
  const { data:leads, error, isLoading:loading } = useGetAllLeadsQuery(userId);
  console.log("leads", leads);
  const handleLeadEdit = (leadId) => {
      dispatch(setLeadId(leadId));
      navigate(`/edit-leads/${leadId}`);
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SideMenu role={role} />

      {/* Page Content */}
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">📋 All Leads</h1>

        {loading ? (
          <p>Loading leads...</p>
        ) : leads?.length === 0 ? (
          <p>No leads found.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Lead Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Company</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads?.length>0 && leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-100">
                  <td className="p-2 border">{lead.id}</td>
                  <td className="p-2 border">{lead.Lead_Name}</td>
                  <td className="p-2 border">{lead.Lead_Phone_Number}</td>
                  <td className="p-2 border">{lead.Lead_Email_Id}</td>
                  <td className="p-2 border">{lead.Company_Name}</td>
                  <td className="p-2 border">{lead.Lead_Status}</td>
                  <td className="p-2 border text-center">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleLeadEdit(lead.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
