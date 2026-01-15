const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const categoriesCtrl = require('../controllers/categories.controller');

router.post('/', auth, categoriesCtrl.create);
router.get('/', categoriesCtrl.findAll);

router.put('/:id', auth, categoriesCtrl.update);
router.delete('/:id', auth, categoriesCtrl.delete);


module.exports = router;
