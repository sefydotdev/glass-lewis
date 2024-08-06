const express = require('express');
const router = express.Router();
const { createRecord } = require('../../controllers/company-records/createController');
const { updateRecord } = require('../../controllers/company-records/updateController');
const { searchRecord } = require('../../controllers/company-records/searchController');
const { fetchRecord } = require('../../controllers/company-records/fetchController');

router.post('/create', createRecord);
router.post('/search', searchRecord);
router.get('/fetch', fetchRecord);
router.post('/update', updateRecord);

module.exports = router;
