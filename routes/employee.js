const express = require('express');
const router = express.Router();
const isLoggedIn = require('connect-ensure-login').ensureLoggedIn();

const employeeModel = require('../models/employee');

/* GET all employees listing. */
router.get('/', isLoggedIn, (req, res) => {
    employeeModel.find(function (err, results) {
        if (err) res.send('no data');
        res.render('employees', {results: results});
    })
});

/* Render form to add a new employee */

router.get('/add', isLoggedIn, (req, res) => {
    res.render('addEmployee');
});

/* New employee form submits here */
router.post('/submit', isLoggedIn, (req, res) => {
    const data = req.body;
    const emp = new employeeModel(data);
    emp.save().then(val => {
            res.render('employees', {result: val});
        }
    );
});

/* Render form to look for specific employee */
router.get('/view', isLoggedIn, (req, res) => {
    res.render('findEmployee');
});


router.post('/view', isLoggedIn, (req, res) => {
    const request = req.body;
    const details = {};
    if (request.firstName) {
        details.firstName = request.firstName;
    }
    if (request.lastName) {
        details.lastName = request.lastName;
    }
    if (request.department) {
        details.department = request.department;
    }
    employeeModel.find(details, (err, results) => {
        if (err) {
            res.send('no data')
        }
        res.render('employees', {results: results});
    });
});


/* Get form to update employee */
router.get('/update/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    employeeModel.find({_id: id}, (err, result) => {
        res.render('updateEmployee', {result: result[0]});
    });
});


/* Update employee */
router.post('/update/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    const data = req.body;
    employeeModel.findOneAndUpdate({_id:id}, data, () => {
       res.redirect('/employees');
    });

});

/* Deletion of employee */
router.get('/delete/:id', isLoggedIn, (req, res) => {
    const id = req.params.id;
    employeeModel.deleteOne({_id: id}, (err) => {
        if (err) {
            res.redirect('/employees');
        }
        else {
            res.redirect('/employees');
        }
    });
});

module.exports = router;
