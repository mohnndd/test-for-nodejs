/**
BACKEND TASK USING BASIC CRUD:

Signup new USER (POST)
Create a Login API (POST)
Get User Profile (GET)
Change Password (PUT)

 */


require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mssql = require('mssql');
const { nextTick } = require('process');
const bcrypt = require('bcrypt');

//middlewhere to parse json object from web
app.use(express.json());

//for pduction run, envriomental variable will be choicen 
const port = process.env.NODE_ENV || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//sign up(post)
app.post('/registration', (req, res) => {

    var sql = require("mssql");

    var userName = req.body.userName; 
        var hash = bcrypt.hash(req.body.password, 10);
        var email = req.body.email;
        var name = req.body.name;
        var address = req.body.address;

        //for production, use ENV
    var config = {
        user: 'sa',
        password: 'P@ssw0rd',
        server: 'Mongler', 
        database: 'test',
        trustServerCertificate: true   
    };

    sql.connect(config, function (err) {
    
        if (err) console.log(err);
        

        //check for duplicated emaisl and username 

        var request = new sql.Request();
           
        //update SQL  
        request.query("insert into [test].[dbo].[user] ( user_name, password, name, email, address) values ('"+userName+"','"+hash+"','"+userName+"','"+email+"','"+address+"')" , function (err) {
            
            if (err) console.log(err)

            // send confirmation  
            res.sendStatus(200);

            
        });
    });

});

//change password (update)
app.post('/passwordChange', authenticateToken, (req, res)=> {

    const userName = req.body.userName;
    const newPassword = req.body.newPassword;
    var hash = bcrypt.hash(req.body.newPassword, 10);


    //get old password

    var sql = require("mssql");

    // my local database on my home development rig, run on MSSQL express 
    //for production, please use the SQL controller 
    var config = {
        user: 'sa',
        password: 'P@ssw0rd',
        server: 'Mongler', 
        database: 'test',
        trustServerCertificate: true   
    };

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        //this portaion of the code is for connection dominstration purposes only 
        request.query( "'insert into [test].[dbo].[user] (password) values ('"+hash+"') where id = " +req.body.userName, function (err, recordset) {
            
            if (err) console.log(err)

            // send dummy record set #1  as a response to check both express and SQL connection 
            res.sendStatus(200);
            
        });
    });

});

//login(post)
app.post('/login', (req, res) => {

    const userName = req.body.userName;
    const user = {name :userName }

    const accessToken = jwt.sign(user, process.env.Access_Token_Secret)
    res.json({accessToken: accessToken})

});

//profile (get)
app.get('/profile',authenticateToken, (req,res)=> {

    //extract username from the token. 
    jwt.verify(req.token, process.env.Access_Token_Secret, function (req, res) {
        
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                text: 'thsi is protected route'
            })
        }
    });
});

function authenticateToken (req, res, next) 
{
    const authHeader = req.header['authroization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401); //error 
    }
    jwt.verify(token, process.env.Access_Token_Secret, (err, user) => {
        console.log(err);

        if (err) return res.sendStatus(403);        //not valid token return
        res.user = user;
        next();
    });
}


//to test the express and MSSQL connectivity  on UAT envrioment only,  
//this end-point is not meant to be published on the on prodction, and it's only used during development testing for the test provided by Abid Lone via email. 
app.get('/', function (req, res) {
   
    var sql = require("mssql");

    // my local database on my home development rig, run on MSSQL express 
    //for production, please use the SQL controller 
    var config = {
        user: 'sa',
        password: 'P@ssw0rd',
        server: 'Mongler', 
        database: 'test',
        trustServerCertificate: true   
    };

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           
        //this portaion of the code is for connection dominstration purposes only 
        request.query('SELECT * FROM [test].[dbo].[user]', function (err, recordset) {
            
            if (err) console.log(err)

            // send dummy record set #1  as a response to check both express and SQL connection 
            res.send(recordset.recordset);
            
        });
    });
});


var server = app.listen(5000, function () {
    console.log('Server is running..');
});
