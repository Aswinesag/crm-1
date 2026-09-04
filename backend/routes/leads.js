const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { getLeads, createLead, updateLead, deleteLead, addNote , getEngineersWithTaskCount, getdeletedLeads, sendQuotation , updateAssignedTo, uploadLeads, getCompanyDetail } = require('../controllers/leadController');
const router = express.Router();
const fileUpload = require('express-fileupload')
const uploadOpts = {
  useTempFiles: true,
  tempFileDir: '/tmp/'
}

const { updateDelivery } = require('../controllers/leadController');
// const upload = require('../middleware/multer');

// Protect all routes
router.use(protect);

// GET /api/leads - Get leads based on role
router.get('/', getLeads);

router.post('/upload-Leads', restrictTo('Super Admin', 'Admin', 'Coordinator'),fileUpload(uploadOpts), uploadLeads)

// POST /api/leads - Create lead (Super Admin, Admin, Coordinator only)
router.post('/', restrictTo('Super Admin', 'Admin', 'Coordinator'), createLead);

// PUT /api/leads/:id - Update lead
router.put('/:id', updateLead);

router.put('/:id/delivery', updateDelivery);

// DELETE /api/leads/:id - Delete lead (Super Admin, Admin only)
router.delete('/:id', restrictTo('Super Admin', 'Admin' ,'Coordinator'), deleteLead);

// POST /api/leads/:id/notes - Add note to lead
router.post('/:id/notes', addNote);

//get engineer data with tasks
router.get('/engineers-with-task-count', getEngineersWithTaskCount);

router.get('/deleted-leads',restrictTo('Super Admin','Admin'),getdeletedLeads);

router.post("/send-quotation/:id",restrictTo('Super Admin','Admin','Engineer'),sendQuotation)

router.put('/update-assigned-to/:id',restrictTo('Super Admin','Admin','Coordinator'),updateAssignedTo);

router.get('/company/:company',restrictTo('Super Admin','Admin','Coordinator'),getCompanyDetail)

module.exports = router;
