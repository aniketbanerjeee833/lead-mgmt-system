const { registerUser, addLead, getLeadsByMonth, getSources, getPriorityByMonth, getStatusByMonth, getFollowUpsDayWiseOfEachUser, getAllLeadsAppliedForClosed, getPendingClosureCount } = require('../controller/adminController');

const router=require('express').Router();

router.post('/register',registerUser);
router.post("/add", addLead);
router.get('/metrics/leads-by-month', getLeadsByMonth);
router.get('/metrics/sources', getSources);
router.get('/metrics/priority-by-month', getPriorityByMonth);
router.get('/metrics/status-by-month', getStatusByMonth);
router.get('/metrics/follow-ups-day-wise-of-each-user', getFollowUpsDayWiseOfEachUser);
router.get("/all-leads-applied-for-closed/:adminId",getAllLeadsAppliedForClosed);
router.get("/pending-closure-count/:adminId",getPendingClosureCount);
module.exports=router;