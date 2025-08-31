

const { notifyAdmin } = require('../socket');
const db = require('../database/config');


const getUser=async(req,res)=>{
    const userId=3
    try {
        const sql = `SELECT * FROM users WHERE id = ?`;
        db.query(sql, [userId], (err, result) => {
            if(err){
                return res.status(500).json({ error: 'Server error' });
            }
            return res.json(result);
        })

      }catch(err){
        return res.status(500).json({ error: 'Server error' });
      }
} 

const getAllLeads=async(req,res)=>{

    const {userId}=req.params
    console.log(userId)

    try{
      const sql = `SELECT * FROM leads WHERE staffId = ? AND Lead_Status NOT IN ('Closed', 'Pending Closure')`;

        db.query(sql,[userId], (err, result) => {
            if(err){
                return res.status(500).json({ error: 'Server error' });
            }
          
            return res.json(result);
        })
    }catch(err){
        return res.status(500).json({ error: 'Server error' });
    }

}


// ✅ Get lead by ID (for prefilled form)
const getLeadById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM leads WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (result.length === 0) return res.status(404).json({ message: "Lead not found" });

    res.json(result[0]); // return single lead
  });
};

// ✅ Update lead by ID
// Update full lead (but user will only change Lead_Status in UI)
const updateLead1 = async (req, res) => {
  const { id } = req.params;
  let {
    Lead_Name,
    Lead_Phone_Number,
    Lead_Wp_Number,
    Lead_Email_Id,
    Lead_Address,
    Lead_Country,
    Lead_City,
    Lead_State,
    Lead_pincode,
    Company_Name,
    Lead_Title,
    Lead_Source,
    Lead_Priority,
    Lead_Description,
    Staff_Name,
    staffId,
    Referrence_Person_Name,
    Referrence_Person_Phone_Number,
    Estimate_Amount,
    Follow_Up_Date,
    Follow_Up_Time,
    Lead_Status,
    userId,
    created_by,
    created_by_email
  } = req.body;

  try {
    // Get the current lead data and user info before update
    // const [currentLead] = await pool.query(
    //   `SELECT l.*, u.adminId, u.name as user_name, u.email as user_email,
    //           a.name as admin_name, a.email as admin_email
    //    FROM leads l 
    //    JOIN users u ON l.userId = u.id 
    //    LEFT JOIN users a ON u.adminId = a.id
    //    WHERE l.id = ?`,
    //   [id]
    // );

    db.query(
      `SELECT l.*, u.admin_id, u.username as user_name, u.email as user_email,
              a.name as admin_name, a.email as admin_email
       FROM leads l 
       JOIN users u ON l.staffId = u.id 
       LEFT JOIN users a ON u.admin_id = a.id
       WHERE l.id = ?`,
      [id],
      (err, currentLead) => {
        if (err) {
          console.error("Error getting lead:", err);
          return res.status(500).json({ error: "Server error" });
        }

    if (currentLead.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const leadData = currentLead[0];
    console.log(leadData);
    const wasStatusChanged = leadData.Lead_Status !== Lead_Status;
    const isClosedStatus = Lead_Status === "Closed";

    // Format date & time if provided
    if (Follow_Up_Date) {
      Follow_Up_Date = new Date(Follow_Up_Date).toISOString().slice(0, 10);
    }
    if (Follow_Up_Time) {
      Follow_Up_Time = new Date(`1970-01-01T${Follow_Up_Time}`).toISOString().slice(11, 19);
    }

    // 🔹 When user requests closure, change status to "Pending Closure" instead of "Closed"
    const finalStatus = isClosedStatus ? "Pending Closure" : Lead_Status;

    const query = `
      UPDATE leads SET 
        Lead_Name = ?,
        Lead_Phone_Number = ?,
        Lead_Wp_Number = ?,
        Lead_Email_Id = ?,
        Lead_Address = ?,
        Lead_Country = ?,
        Lead_City = ?,
        Lead_State = ?,
        Lead_pincode = ?,
        Company_Name = ?,
        Lead_Title = ?,
        Lead_Source = ?,
        Lead_Priority = ?,
        Lead_Description = ?,
        Staff_Name = ?,
        staffId = ?,
        Referrence_Person_Name = ?,
        Referrence_Person_Phone_Number = ?,
        Estimate_Amount = ?,
        Follow_Up_Date = ?,
        Follow_Up_Time = ?,
        Lead_Status = ?,
        userId = ?,
        created_by = ?,
        created_by_email = ?,
        closure_requested_at = ${isClosedStatus ? 'NOW()' : 'closure_requested_at'},
        closure_requested_by = ${isClosedStatus ? '?' : 'closure_requested_by'},
        updated_at = NOW()
      WHERE id = ?`;

    const values = [
      Lead_Name,
      Lead_Phone_Number,
      Lead_Wp_Number,
      Lead_Email_Id,
      Lead_Address,
      Lead_Country,
      Lead_City,
      Lead_State,
      Lead_pincode,
      Company_Name,
      Lead_Title,
      Lead_Source,
      Lead_Priority,
      Lead_Description,
      Staff_Name,
      staffId,
      Referrence_Person_Name,
      Referrence_Person_Phone_Number,
      Estimate_Amount,
      Follow_Up_Date || null,
      Follow_Up_Time || null,
      finalStatus, // "Pending Closure" instead of "Closed"
      userId,
      created_by,
      created_by_email
    ];

    // Add closure_requested_by if requesting closure
    if (isClosedStatus) {
      values.push(leadData.userId); // The user requesting closure
    }
    
    values.push(id);

    // const [result] = await pool.query(query, values);
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error updating lead:", err);
        return res.status(500).json({ error: "Server error" });
      }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // 🔹 Send real-time notification to admin for approval
    if (wasStatusChanged && isClosedStatus && leadData.adminId) {
      const notificationData = {
        type: 'CLOSURE_REQUEST',
        message: `${leadData.user_name} has requested to close lead "${Lead_Name || leadData.Lead_Name}"`,
        leadId: id,
        leadName: Lead_Name || leadData.Lead_Name,
        companyName: Company_Name || leadData.Company_Name,
        requestedBy: {
          id: leadData.staff,
          name: leadData.user_name,
          email: leadData.user_email
        },
        timestamp: new Date().toISOString(),
        priority: Lead_Priority || leadData.Lead_Priority,
        requiresAction: true
      };

      // Send to specific admin
   notifyAdmin(leadData.adminId, "closure_request", notificationData);

      console.log(`📢 Closure request sent to admin ${leadData.adminId}: Lead ${id}`);
    }

    res.json({ 
      message: isClosedStatus ? "Closure request sent to admin for approval" : "Lead updated successfully",
      status: finalStatus,
      requiresApproval: isClosedStatus
    });
  })
      })
  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// const updateLead = async (req, res) => {
//   const { id } = req.params;
//   let {
//     Lead_Name,
//     Lead_Phone_Number,
//     Lead_Wp_Number,
//     Lead_Email_Id,
//     Lead_Address,
//     Lead_Country,
//     Lead_City,
//     Lead_State,
//     Lead_pincode,
//     Company_Name,
//     Lead_Title,
//     Lead_Source,
//     Lead_Priority,
//     Lead_Description,
//     Staff_Name,
//     staffId,
//     Referrence_Person_Name,
//     Referrence_Person_Phone_Number,
//     Estimate_Amount,
//     Follow_Up_Date,
//     Follow_Up_Time,
//     Lead_Status,
//     userId,
//     created_by,
//     created_by_email
//   } = req.body;

//   try {
//     // ✅ Fetch current lead & staff info to know which admin to notify
//     const sql = `
//       SELECT l.*, 
//              s.admin_id, 
//              s.username AS staff_name, 
//              s.email AS staff_email,
//              a.name AS admin_name, 
//              a.email AS admin_email
//       FROM leads l
//       JOIN users s ON l.staffId = s.id   -- staff assigned to lead
//       LEFT JOIN users a ON s.admin_id = a.id
//       WHERE l.id = ?;
//     `;

//     db.query(sql, [id], (err, currentLead) => {
//       if (err) {
//         console.error("Error getting lead:", err);
//         return res.status(500).json({ error: "Server error" });
//       }

//       if (currentLead.length === 0) {
//         return res.status(404).json({ error: "Lead not found" });
//       }

//       const leadData = currentLead[0];

//       // ✅ Detect if status changed to Closed
//       const wasStatusChanged = leadData.Lead_Status !== Lead_Status;
//       const isClosedStatus = Lead_Status === "Closed";

//       // ✅ Format dates properly
//       if (Follow_Up_Date) {
//         Follow_Up_Date = new Date(Follow_Up_Date).toISOString().slice(0, 10);
//       }
//       if (Follow_Up_Time) {
//         Follow_Up_Time = new Date(`1970-01-01T${Follow_Up_Time}`).toISOString().slice(11, 19);
//       }

//       // ✅ If user tries to "Close", actually mark it as "Pending Closure"
//       const finalStatus = isClosedStatus ? "Pending Closure" : Lead_Status;

//       const query = `
//         UPDATE leads SET 
//           Lead_Name = ?,
//           Lead_Phone_Number = ?,
//           Lead_Wp_Number = ?,
//           Lead_Email_Id = ?,
//           Lead_Address = ?,
//           Lead_Country = ?,
//           Lead_City = ?,
//           Lead_State = ?,
//           Lead_pincode = ?,
//           Company_Name = ?,
//           Lead_Title = ?,
//           Lead_Source = ?,
//           Lead_Priority = ?,
//           Lead_Description = ?,
//           Staff_Name = ?,
//           staffId = ?,
//           Referrence_Person_Name = ?,
//           Referrence_Person_Phone_Number = ?,
//           Estimate_Amount = ?,
//           Follow_Up_Date = ?,
//           Follow_Up_Time = ?,
//           Lead_Status = ?,
//           userId = ?,
//           created_by = ?,
//           created_by_email = ?,
//           closure_requested_at = ${isClosedStatus ? "NOW()" : "closure_requested_at"},
//           closure_requested_by = ${isClosedStatus ? "?" : "closure_requested_by"},
//           updated_at = NOW()
//         WHERE id = ?;
//       `;

//       const values = [
//         Lead_Name,
//         Lead_Phone_Number,
//         Lead_Wp_Number,
//         Lead_Email_Id,
//         Lead_Address,
//         Lead_Country,
//         Lead_City,
//         Lead_State,
//         Lead_pincode,
//         Company_Name,
//         Lead_Title,
//         Lead_Source,
//         Lead_Priority,
//         Lead_Description,
//         Staff_Name,
//         staffId,
//         Referrence_Person_Name,
//         Referrence_Person_Phone_Number,
//         Estimate_Amount,
//         Follow_Up_Date || null,
//         Follow_Up_Time || null,
//         finalStatus,
//         userId,
//         created_by,
//         created_by_email,
//       ];

//       // if closure requested, push staffId as requester
//       if (isClosedStatus) {
//         values.push(staffId);
//       }

//       values.push(id);

//       db.query(query, values, (err, result) => {
//         if (err) {
//           console.error("Error updating lead:", err);
//           return res.status(500).json({ error: "Server error" });
//         }

//         if (result.affectedRows === 0) {
//           return res.status(404).json({ error: "Lead not found" });
//         }

//         // ✅ Notify admin if closure request was made
//         if (wasStatusChanged && isClosedStatus && leadData.admin_id) {
//           const notificationData = {
//             type: "CLOSURE_REQUEST",
//             message: `${leadData.staff_name} requested to close lead "${Lead_Name || leadData.Lead_Name}"`,
//             leadId: id,
//             leadName: Lead_Name || leadData.Lead_Name,
//             companyName: Company_Name || leadData.Company_Name,
//             requestedBy: {
//               id: staffId,
//               name: leadData.staff_name,
//               email: leadData.staff_email,
//             },
//             timestamp: new Date().toISOString(),
//             priority: Lead_Priority || leadData.Lead_Priority,
//             requiresAction: true,
//           };

//           // emit socket event
//           notifyAdmin(leadData.admin_id, "closure_request", notificationData);

//           console.log(`📢 Closure request sent to admin ${leadData.admin_id}: Lead ${id}`);
//         }

//         res.json({
//           message: isClosedStatus
//             ? "Closure request sent to admin for approval"
//             : "Lead updated successfully",
//           status: finalStatus,
//           requiresApproval: isClosedStatus,
//         });
//       });
//     });
//   } catch (err) {
//     console.error("DB update error:", err);
//     res.status(500).json({ error: "Database error", details: err.message });
//   }
// };
const updateLead = async (req, res) => {
  const { id } = req.params;

  const {
    admin_id,
    Lead_Name,
    Lead_Phone_Number,
    Lead_Wp_Number,
    Lead_Email_Id,
    Lead_Address,
    Lead_Country,
    Lead_City,
    Lead_State,
    Lead_pincode,
    Company_Name,
    Lead_Title,
    Lead_Source,
    Lead_Priority,
    Lead_Description,
    Staff_Name,
    staffId,
    Referrence_Person_Name,
    Referrence_Person_Phone_Number,
    Estimate_Amount,
    Follow_Up_Date,
    Follow_Up_Time,
    Lead_Status,
    userId,
    created_by,
    created_by_email
  } = req.body;

  try {
    const getCurrentLeadSql = `
      SELECT l.*, 
             s.name AS staff_name, 
             s.email AS staff_email,
             s.admin_id as staff_admin_id
      FROM leads l
      LEFT JOIN users s ON l.staffId = s.id
      WHERE l.id = ?
    `;

    db.query(getCurrentLeadSql, [id], (err, currentLead) => {
      if (err) {
        console.error("Error getting current lead:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (currentLead.length === 0) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const leadData = currentLead[0];
      const wasStatusChanged = leadData.Lead_Status !== Lead_Status;
      const isClosedStatus = Lead_Status === "Closed";

      // ✅ Use new variables for formatted date/time
      const formattedFollowUpDate = Follow_Up_Date
        ? new Date(Follow_Up_Date).toISOString().slice(0, 10)
        : null;

      const formattedFollowUpTime = Follow_Up_Time
        ? new Date(`1970-01-01T${Follow_Up_Time}`).toISOString().slice(11, 19)
        : null;

      const finalStatus = isClosedStatus ? "Pending Closure" : Lead_Status;

      const updateLeadSql = `
        UPDATE leads SET 
          Lead_Name = ?,
          Lead_Phone_Number = ?,
          Lead_Wp_Number = ?,
          Lead_Email_Id = ?,
          Lead_Address = ?,
          Lead_Country = ?,
          Lead_City = ?,
          Lead_State = ?,
          Lead_pincode = ?,
          Company_Name = ?,
          Lead_Title = ?,
          Lead_Source = ?,
          Lead_Priority = ?,
          Lead_Description = ?,
          Staff_Name = ?,
          staffId = ?,
          Referrence_Person_Name = ?,
          Referrence_Person_Phone_Number = ?,
          Estimate_Amount = ?,
          Follow_Up_Date = ?,
          Follow_Up_Time = ?,
          Lead_Status = ?,
          userId = ?,
          created_by = ?,
          created_by_email = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        Lead_Name,
        Lead_Phone_Number,
        Lead_Wp_Number,
        Lead_Email_Id,
        Lead_Address,
        Lead_Country,
        Lead_City,
        Lead_State,
        Lead_pincode,
        Company_Name,
        Lead_Title,
        Lead_Source,
        Lead_Priority,
        Lead_Description,
        Staff_Name,
        staffId,
        Referrence_Person_Name,
        Referrence_Person_Phone_Number,
        Estimate_Amount,
        formattedFollowUpDate,
        formattedFollowUpTime,
        finalStatus,
        userId,
        created_by,
        created_by_email,
        id
      ];

      db.query(updateLeadSql, values, (err, result) => {
        if (err) {
          console.error("Error updating lead:", err.sqlMessage || err);
          return res.status(500).json({ error: "Server error" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Lead not found" });
        }

        // If closure was requested, create entry in closure_requests
        if (wasStatusChanged && isClosedStatus && admin_id) {
          const closureRequestSql = `
            INSERT INTO closure_requests (
              lead_id, 
              admin_id, 
              closure_requested_by,
              closure_requested_at,
              status
            ) VALUES (?, ?, ?, NOW(), 'pending')
          `;

          db.query(closureRequestSql, [id, admin_id, staffId], (err, closureResult) => {
            if (err) {
              console.error("Error creating closure request:", err);
              return res.status(500).json({ error: "Failed to create closure request" });
            }

            return res.json({
              message: "Closure request sent to admin for approval",
              status: finalStatus,
              requiresApproval: true,
              closureRequestId: closureResult.insertId
            });
          });
        } else {
          return res.json({
            message: "Lead updated successfully",
            status: finalStatus,
            requiresApproval: false
          });
        }
      });
    });

  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// const handleClosureDecision = async (req, res) => {
//   const { leadId } = req.params;
//   const { action, reason } = req.body; // action: 'approve' or 'reject'
//   const adminId = req.user.id;

//   try {
//     // Get closure request details
//     const getRequestSql = `
//       SELECT cr.*, l.Lead_Name, l.Company_Name, u.name as requester_name
//       FROM closure_requests cr
//       JOIN leads l ON cr.lead_id = l.id
//       JOIN users u ON cr.closure_requested_by = u.id
//       WHERE cr.lead_id = ? AND cr.admin_id = ? AND cr.status = 'pending'
//     `;

//     db.query(getRequestSql, [leadId, adminId], (err, requests) => {
//       if (err) {
//         console.error("Error getting closure request:", err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       if (requests.length === 0) {
//         return res.status(404).json({ error: "Closure request not found or already processed" });
//       }

//       const closureRequest = requests[0];

//       if (action === "approve") {
//         // 1. Update lead status to "Closed"
//         const updateLeadSql = `UPDATE leads SET Lead_Status = 'Closed' WHERE id = ?`;

//         db.query(updateLeadSql, [leadId], (err) => {
//           if (err) {
//             console.error("Error updating lead:", err);
//             return res.status(500).json({ error: "Failed to update lead" });
//           }

//           // 2. Update closure request as approved
//           const updateClosureRequestSql = `
//             UPDATE closure_requests SET 
//               status = 'approved',
//               closure_approved_at = NOW(),
//               closure_approved_by = ?,
//               closure_reason = ?
//             WHERE id = ?
//           `;

//           db.query(updateClosureRequestSql, [adminId, reason, closureRequest.id], (err) => {
//             if (err) {
//               console.error("Error updating closure request:", err);
//               return res.status(500).json({ error: "Failed to update closure request" });
//             }

//             console.log(`✅ Lead ${leadId} closure approved by admin ${adminId}`);
//             res.json({
//               message: "Lead closure approved successfully",
//               status: "Closed",
//             });
//           });
//         });

//       } else if (action === "reject") {
//         // 1. Update lead status back to "Active"
//         const updateLeadSql = `UPDATE leads SET Lead_Status = 'Active' WHERE id = ?`;

//         db.query(updateLeadSql, [leadId], (err) => {
//           if (err) {
//             console.error("Error updating lead:", err);
//             return res.status(500).json({ error: "Failed to update lead" });
//           }

//           // 2. Update closure request as rejected
//           const updateClosureRequestSql = `
//             UPDATE closure_requests SET 
//               status = 'rejected',
//               closure_rejected_at = NOW(),
//               closure_rejected_by = ?,
//               closure_reason = ?
//             WHERE id = ?
//           `;

//           db.query(updateClosureRequestSql, [adminId, reason, closureRequest.id], (err) => {
//             if (err) {
//               console.error("Error updating closure request:", err);
//               return res.status(500).json({ error: "Failed to update closure request" });
//             }

//             console.log(`❌ Lead ${leadId} closure rejected by admin ${adminId}`);
//             res.json({
//               message: "Lead closure rejected successfully",
//               status: "Active",
//             });
//           });
//         });

//       } else {
//         return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'" });
//       }
//     });
//   } catch (err) {
//     console.error("Error handling closure decision:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// const getClosureHistory = async (req, res) => {
//   const { leadId } = req.params;

//   try {
//     const sql = `
//       SELECT 
//         cr.*,
//         u1.name as requested_by_name,
//         u2.name as approved_by_name,
//         u3.name as rejected_by_name
//       FROM closure_requests cr
//       LEFT JOIN users u1 ON cr.closure_requested_by = u1.id
//       LEFT JOIN users u2 ON cr.closure_approved_by = u2.id
//       LEFT JOIN users u3 ON cr.closure_rejected_by = u3.id
//       WHERE cr.lead_id = ?
//       ORDER BY cr.created_at DESC
//     `;

//     db.query(sql, [leadId], (err, results) => {
//       if (err) {
//         console.error("Error getting closure history:", err);
//         return res.status(500).json({ error: "Server error" });
//       }
      
//       res.json(results);
//     });

//   } catch (error) {
//     console.error("Error getting closure history:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// ✅ Controller to get all closed leads under an admin



module.exports={
    getUser,
    getAllLeads,
    getLeadById,
    updateLead
}