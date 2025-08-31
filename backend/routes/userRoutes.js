const router=require('express').Router();

const {getUser, getAllLeads, getLeadById, updateLead}=require('../controller/userController');
router.get('/user',getUser);
router.get("/all-leads/:userId",getAllLeads);
router.get("/lead/:id",getLeadById);
router.put("/updatelead/:id",updateLead);

module.exports=router;