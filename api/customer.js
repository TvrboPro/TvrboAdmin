const express = require('express');
const router = express.Router();
const wrap = require('../lib/wrap.js');
// DB
const Customer = require('../models/customer.js');

// API DEFINITIONS
router.get('/customers/:id', [ wrap(getCustomer) ]);
router.get('/customers', [ wrap(listCustomers) ]);
router.post('/customers', [ wrap(addCustomer) ]);
router.put('/customers/:id', [ wrap(updateCustomer) ]);
router.delete('/customers/:id', [ wrap(removeCustomer) ]);

// API ROUTINES
function* listCustomers(req, res){
	const perPage = parseInt(req.query._perPage);
	const start = (parseInt(req.query._page) - 1) * perPage;
	const sortBy = (req.query._sortDir == 'ASC' ? '' : '-') + req.query._sortField;

	const count = yield Customer.count(JSON.parse(req.query._filters || '{}')).exec();
	res.set("X-Total-Count", count);

	const customers = yield Customer.find(JSON.parse(req.query._filters || '{}')).sort(sortBy).skip(start).limit(perPage).exec();
	res.send(customers);
}

function* getCustomer(req, res){
	const data = yield Customer.findById(req.params.id).lean().exec();
	if(!data) return res.status(404).send('Not found');
	res.send(data);
}

function* updateCustomer(req, res){
	req.body.date = new Date();

	const data = yield Customer.findByIdAndUpdate(req.params.id, req.body).lean().exec();
	if(!data) return res.status(404).send('Not found');
	res.send(data);
}

function* addCustomer(req, res) {
	req.body.date = new Date();

	const data = yield Customer.create(req.body)
	if(!data) return res.status(404).send('Not found');
	res.send(data);
}

function* removeCustomer(req, res){
	yield Customer.findByIdAndRemove(req.params.id).exec();
	res.send();
}

module.exports = router;
