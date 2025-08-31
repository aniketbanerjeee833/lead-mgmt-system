const pool = require('../database/config'); // if you export directly
// or const { pool } = require('../database/config'); if you exported { pool }

const registerUser = async (req, res) => {
  try {
    const { id,name, email, username, password, role } = req.body;

    const sql = `INSERT INTO users(id,name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [id,name, email, username, password, role]);

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

const addLead = async (req, res) => {
  try {
    const {
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
      created_by,
      created_by_email,
      userId
    } = req.body;

    // Insert query
    const query = `
      INSERT INTO leads (
        Lead_Name, Lead_Phone_Number, Lead_Wp_Number, Lead_Email_Id, Lead_Address,
        Lead_Country, Lead_City, Lead_State, Lead_pincode, Company_Name,
        Lead_Title, Lead_Source, Lead_Priority, Lead_Description, Staff_Name,
        staffId,
        Referrence_Person_Name, Referrence_Person_Phone_Number, Estimate_Amount,
        Follow_Up_Date, Follow_Up_Time, Lead_Status, created_by, created_by_email, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
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
      Follow_Up_Date,
      Follow_Up_Time,
      Lead_Status,
      created_by,
      created_by_email,
      userId
    ];

    const [result] = await pool.execute(query, values);

    res.status(201).json({
      success: true,
      message: "Lead added successfully",
      leadId: result.insertId
    });
  } catch (error) {
    console.error("Error inserting lead:", error);
    res.status(500).json({
      success: false,
      message: "Error adding lead",
      error: error.message
    });
  }
};

// const getLeadsByMonth = async (req, res) => {
//   try {
//     const adminId = parseInt(req.query.adminId);
//     const year = parseInt(req.query.year);
//     if (!adminId) return res.status(400).json({ error: 'adminId required' });

//     const params = [adminId];
//     let sql = `
//       SELECT YEAR(l.created_at) AS year,
//              MONTH(l.created_at) AS month,
//              COUNT(*) AS total
//       FROM leads l
//       INNER JOIN users u ON u.id = l.userId
//       WHERE u.admin_id = ?
//     `;
//     if (year) {
//       sql += ` AND YEAR(l.created_at) = ?`;
//       params.push(year);
//     }
//     sql += `
//       GROUP BY YEAR(l.created_at), MONTH(l.created_at)
//       ORDER BY YEAR(l.created_at), MONTH(l.created_at)
//     `;

//     const [rows] = await pool.query(sql, params);
//     return res.json(rows); // [{year, month, total}]
//   } catch (err) {
//     console.error('getLeadsByMonth error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };
// helper: month names (optional for frontend readability)
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * GET /api/admin/metrics/leads-by-month?adminId=2&year=2025
 * Returns data like: [{year: 2025, month: 1, total: 3}, ...]
 */
const getFollowUpsDayWiseOfEachUser = async (req, res) => {
  
  const adminId = parseInt(req.query.adminId);
  const day=req.query.day
  if (!adminId) return res.status(400).json({ error: 'adminId required' });

  const params = [adminId,day];
 const sql = `
  SELECT DATE_FORMAT(l.Follow_Up_Date, '%Y-%m-%d') AS date,
         u.id AS userId,
         u.username AS username,
         COUNT(*) AS total
  FROM leads l
  INNER JOIN users u ON u.id = l.staffId
  WHERE u.admin_id = ? 
    AND l.Follow_Up_Date = ?
  GROUP BY u.id, DATE(l.Follow_Up_Date);
`;
  try {
    const [rows] = await pool.query(sql, params);
    return res.json(rows); // [{date, total}]
  } catch (err) {
    console.error('getLeadsByMonth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
 
}
const getLeadsByMonth = async (req, res) => {
  try {
    const adminId = parseInt(req.query.adminId);
    const year = parseInt(req.query.year);
    if (!adminId) return res.status(400).json({ error: 'adminId required' });
    if (!year) return res.status(400).json({ error: 'year required' });

    const params = [adminId, year];
    const sql = `
      SELECT m.month AS month,
             COALESCE(COUNT(l.id), 0) AS total
      FROM (
        SELECT 1 AS month UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION
        SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION
        SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      ) m
      LEFT JOIN leads l 
        ON MONTH(l.created_at) = m.month 
       AND YEAR(l.created_at) = ?
      INNER JOIN users u ON u.id = l.userId
       AND u.admin_id = ?
      GROUP BY m.month
      ORDER BY m.month;
    `;

    const [rows] = await pool.query(sql, [year, adminId]);

    // Add year + month name for frontend clarity
    const result = rows.map(r => ({
      year,
      month: r.month,
      monthName: MONTHS[r.month - 1],
      total: r.total
    }));

    return res.json(result);
  } catch (err) {
    console.error("getLeadsByMonth error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/admin/metrics/sources?adminId=1&year=2025
 * Distribution by Lead_Source
 */
// const getSources = async (req, res) => {
//   try {
//     const adminId = parseInt(req.query.adminId);
//     const year = parseInt(req.query.year);
//     if (!adminId) return res.status(400).json({ error: 'adminId required' });

//     const params = [adminId];
//     let sql = `
//       SELECT l.Lead_Source AS source, COUNT(*) AS total
//       FROM leads l
//       INNER JOIN users u ON u.id = l.userId
//       WHERE u.admin_id = ?
//     `;
//     if (year) {
//       sql += ` AND YEAR(l.created_at) = ?`;
//       params.push(year);
//     }
//     sql += ` GROUP BY l.Lead_Source ORDER BY total DESC`;

//     const [rows] = await pool.query(sql, params);
//     return res.json(rows); // [{source, total}]
//   } catch (err) {
//     console.error('getSources error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

// /**
//  * GET /api/admin/metrics/priority-by-month?adminId=1&year=2025
//  * Month-wise counts by Lead_Priority (stacked chart)
//  */
// const getPriorityByMonth = async (req, res) => {
//   try {
//     const adminId = parseInt(req.query.adminId);
//     const year = parseInt(req.query.year);
//     if (!adminId) return res.status(400).json({ error: 'adminId required' });

//     const params = [adminId];
//     let sql = `
//       SELECT YEAR(l.created_at) AS year,
//              MONTH(l.created_at) AS month,
//              l.Lead_Priority AS priority,
//              COUNT(*) AS total
//       FROM leads l
//       INNER JOIN users u ON u.id = l.userId
//       WHERE u.admin_id = ?
//     `;
//     if (year) {
//       sql += ` AND YEAR(l.created_at) = ?`;
//       params.push(year);
//     }
//     sql += `
//       GROUP BY YEAR(l.created_at), MONTH(l.created_at), l.Lead_Priority
//       ORDER BY YEAR(l.created_at), MONTH(l.created_at)
//     `;

//     const [rows] = await pool.query(sql, params);
//     return res.json(rows); // [{year, month, priority, total}]
//   } catch (err) {
//     console.error('getPriorityByMonth error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };
// const getStatusByMonth = async (req, res) => {
//   try {
//     const adminId = parseInt(req.query.adminId);
//     const year = parseInt(req.query.year);
//     if (!adminId) return res.status(400).json({ error: 'adminId required' });

//     const params = [adminId];
//     let sql = `
//       SELECT YEAR(l.created_at) AS year,
//              MONTH(l.created_at) AS month,
//              l.Lead_Status AS status,
//              COUNT(*) AS total
//       FROM leads l
//       INNER JOIN users u ON u.id = l.userId
//       WHERE u.admin_id = ?
//     `;
//     if (year) {
//       sql += ` AND YEAR(l.created_at) = ?`;
//       params.push(year);
//     }
//     sql += `
//       GROUP BY YEAR(l.created_at), MONTH(l.created_at), l.Lead_Status
//       ORDER BY YEAR(l.created_at), MONTH(l.created_at)
//     `;

//     const [rows] = await pool.query(sql, params);
//     return res.json(rows); // [{year, month, status, total}]
//   } catch (err) {
//     console.error('getStatusByMonth error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };
// ---------------- SOURCES by month (all 12 months) ----------------
const getSources = async (req, res) => {
  try {
    const adminId = parseInt(req.query.adminId);
    const year = parseInt(req.query.year);
    if (!adminId || !year) return res.status(400).json({ error: 'adminId and year required' });

    const sql = `
      SELECT m.month,
             COALESCE(s.source, 'N/A') AS source,
             COALESCE(s.total, 0) AS total
      FROM (
        SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
        UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
      ) m
      LEFT JOIN (
        SELECT MONTH(l.created_at) AS month,
               l.Lead_Source AS source,
               COUNT(*) AS total
        FROM leads l
        INNER JOIN users u ON u.id = l.userId
        WHERE u.admin_id = ? AND YEAR(l.created_at) = ?
        GROUP BY MONTH(l.created_at), l.Lead_Source
      ) s ON m.month = s.month
      ORDER BY m.month, s.total DESC
    `;

    const [rows] = await pool.query(sql, [adminId, year]);
    return res.json(rows); // [{month, source, total}]
  } catch (err) {
    console.error('getSources error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


// ---------------- PRIORITY by month (all 12 months) ----------------
const getPriorityByMonth = async (req, res) => {
  try {
    const adminId = parseInt(req.query.adminId);
    const year = parseInt(req.query.year);
    if (!adminId || !year) return res.status(400).json({ error: 'adminId and year required' });

    const sql = `
      SELECT m.month,
             COALESCE(p.priority, 'N/A') AS priority,
             COALESCE(p.total, 0) AS total
      FROM (
        SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
        UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
      ) m
      LEFT JOIN (
        SELECT MONTH(l.created_at) AS month,
               l.Lead_Priority AS priority,
               COUNT(*) AS total
        FROM leads l
        INNER JOIN users u ON u.id = l.userId
        WHERE u.admin_id = ? AND YEAR(l.created_at) = ?
        GROUP BY MONTH(l.created_at), l.Lead_Priority
      ) p ON m.month = p.month
      ORDER BY m.month
    `;

    const [rows] = await pool.query(sql, [adminId, year]);
    return res.json(rows); // [{month, priority, total}]
  } catch (err) {
    console.error('getPriorityByMonth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


// ---------------- STATUS by month (all 12 months) ----------------
const getStatusByMonth = async (req, res) => {
  try {
    const adminId = parseInt(req.query.adminId);
    const year = parseInt(req.query.year);
    if (!adminId || !year) return res.status(400).json({ error: 'adminId and year required' });

    const sql = `
      SELECT m.month,
             COALESCE(s.status, 'N/A') AS status,
             COALESCE(s.total, 0) AS total
      FROM (
        SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
        UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
      ) m
      LEFT JOIN (
        SELECT MONTH(l.created_at) AS month,
               l.Lead_Status AS status,
               COUNT(*) AS total
        FROM leads l
        INNER JOIN users u ON u.id = l.userId
        WHERE u.admin_id = ? AND YEAR(l.created_at) = ?
        GROUP BY MONTH(l.created_at), l.Lead_Status
      ) s ON m.month = s.month
      ORDER BY m.month
    `;

    const [rows] = await pool.query(sql, [adminId, year]);
    return res.json(rows); // [{month, status, total}]
  } catch (err) {
    console.error('getStatusByMonth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getAllLeadsAppliedForClosed = async (req, res) => {
  const { adminId } = req.params;

  try {
    const sql = `
      SELECT 
        l.*,
        cr.id as closure_request_id,
        cr.closure_requested_at,
        cr.closure_requested_by,
        cr.status as closure_status,
        u1.name as requested_by_name,
        u1.email as requested_by_email,
        u2.name as staff_name,
        u2.email as staff_email,
        TIMESTAMPDIFF(HOUR, cr.closure_requested_at, NOW()) as hours_pending
      FROM leads l
      JOIN closure_requests cr ON l.id = cr.lead_id
      JOIN users u1 ON cr.closure_requested_by = u1.id
      LEFT JOIN users u2 ON l.staffId = u2.id
      WHERE cr.admin_id = ? 
      AND cr.status = 'pending'
      AND l.Lead_Status = 'Pending Closure'
      ORDER BY cr.closure_requested_at DESC
    `;

    pool.query(sql, [adminId], (err, results) => {
      if (err) {
        console.error("Error getting closure requests:", err);
        return res.status(500).json({ error: "Server error" });
      }
      
      return res.json(results);
    });
    
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// const getAllLeadsAppliedForClosed = async (req, res) => {
//   const { adminId } = req.params;

//   try {
//     const sql = `
//       SELECT 
//         l.*,
//         u1.name as requested_by_name,
//         u1.email as requested_by_email,
//         u2.name as staff_name,
//         u2.email as staff_email,
//         TIMESTAMPDIFF(HOUR, l.closure_requested_at, NOW()) as hours_pending
//       FROM leads l
//       JOIN users u1 ON l.userId = u1.id
//       LEFT JOIN users u2 ON l.staffId = u2.id
//       WHERE l.Lead_Status = "Pending Closure"
//       AND u1.admin_id = ?
//       ORDER BY l.closure_requested_at DESC
//     `;

//     // const [results] = await pool.query(sql, [adminId]);
//     pool.query(sql, [adminId], (err, results) => {
//       if (err) {
//         console.error("Error getting leads:", err);
//         return res.status(500).json({ error: "Server error" });
//       }
//           return res.json(results);
//     })


//   } catch (err) {
//     console.error("Server error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
const getPendingClosureCount = async (req, res) => {
  const {adminId}=req.params;

  try {
    // const [result] = await pool.query(
    //   `SELECT COUNT(*) as count 
    //    FROM leads l 
    //    JOIN users u ON l.userId = u.id 
    //    WHERE l.Lead_Status = "Pending Closure" AND u.adminId = ?`,
    //   [adminId]
    // );

    pool.query(
      `SELECT COUNT(*) as count 
       FROM leads l 
       JOIN users u ON l.staffId = u.id 
       WHERE l.Lead_Status = "Pending Closure" AND u.admin_id = ?`,
      [adminId],
      (err, result) => {
        if (err) {
          console.error("Error getting pending count:", err);
          return res.status(500).json({ error: "Server error" });
        }
        res.json({ count: result[0].count });
      }
    )
   
  } catch (error) {
    console.error("Error getting pending count:", error);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { registerUser,addLead ,getLeadsByMonth, getSources, getPriorityByMonth, getStatusByMonth,
  getAllLeadsAppliedForClosed,getFollowUpsDayWiseOfEachUser,getPendingClosureCount};
