import { useEffect, useState } from "react";


import { useNavigate, useParams } from "react-router-dom";
import SideMenu from "../layout/SideMenu";
import { useDispatch, useSelector } from "react-redux";
import { useGetAllLeadsAppliedForClosedQuery } from "../redux/api/userApi";

export default function AdminNotifications() {
 
  const [leads, setLeads] = useState([]);

      const navigate=useNavigate();
      const dispatch = useDispatch();
    const { role, userId:adminId} = useSelector((state) => state.user); // ✅ get role + userId from redux

    // const{data:leadsAppliedForClosure, error:leadsAppliedForClosureError, isLoading:leadsAppliedForClosureLoading } = 
    // useGetAllLeadsAppliedForClosedQuery(adminId);
    const {
  data: leadsAppliedForClosure,
  error: leadsAppliedForClosureError,
  isLoading: leadsAppliedForClosureLoading,
} = useGetAllLeadsAppliedForClosedQuery(adminId, {
  pollingInterval: 5000,
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

    console.log(leadsAppliedForClosure)
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SideMenu role={role} />

      {/* Page Content */}
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">📋 Leads Applied for Closure</h1>

        {leadsAppliedForClosureLoading ? (
          <p>Loading leads...</p>
        ) : leadsAppliedForClosure?.length === 0 ? (
          <p className="text-gray-500">No leads found.</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Lead Name</th>
                <th className="border px-4 py-2 text-left">User</th>
                <th className="border px-4 py-2 text-left">Staff</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Date Applied</th>
              </tr>
            </thead>
            <tbody>
              {leadsAppliedForClosure?.map((lead, index) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{lead.Lead_Name}</td>
                  <td className="border px-4 py-2">{lead.userId}</td>
                  <td className="border px-4 py-2">{lead.staffId}</td>
                  <td className="border px-4 py-2 font-medium text-red-600">
                    {lead.Lead_Status}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(lead.updated_at).toLocaleDateString()}
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
