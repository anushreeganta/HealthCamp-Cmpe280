//import express module
var express = require('express');
//create an express app
var app = express();

var mysql = require('mysql');

//require express middleware body-parser
var bodyParser = require('body-parser');

var cors = require('cors');

//set the view engine to ejs
app.set('view engine', 'ejs');
//set the directory of views
app.set('views', './views');
//specify the path of static directory
app.use(express.static(__dirname + './public'));

app.use(cors({origin: null, credentials: true}));

//allow access control
app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '.');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});
//use body parser to parse JSON and urlencoded request body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


var con = mysql.createConnection({
    port: '3306',
    host: 'db4free.net',
    // host: '85.10.205.173',
    user: 'sjsu_anushree',
    password: 'mK@ELV3EjBC45Bu',
    database: 'sjsu_projects280'
})


//route to create the patient
app.post('/create_patient', function(req,res){
    console.log("Received request to create user: " + req.body.fName);
    var newPatient = {firstName: req.body.fName, lastName: req.body.lName, gender: req.body.gender, age: req.body.age};

    // con.connect();

    console.log("newPatient:", newPatient);
    // console.log("connection", con);
    con.connect(function(err){
        if(err){
          console.log("Connection Error", err);
            throw err;
        }
        console.log("Connected to DB");

        var sql = "INSERT INTO healthapp_patients (fName, lName, age, gender, photo, medications, notes) VALUES("
            + mysql.escape(req.body.fName) + ","
            + mysql.escape(req.body.lName) + ","
            + mysql.escape(req.body.age) + ","
            + mysql.escape(req.body.gender) + ",'','','')";
            // + mysql.escape(req.body.photo) + ", '', '')";
        console.log(sql);

        con.query(sql, function(err, result){
            if(err){
                console.log(err);
                res.writeHead(404,{
                    'Content-Type' : 'text/plain'
                })
                res.end("Could not create user");
            }
            else{
                res.setHeader('status', 200);
                res.json({success: "User added to DB", new_id: result.insertId});
            }
        })
    });
});

//route to update the patient
app.post('/update_patient', function(req, res){
    var sql = "UPDATE healthapp_patients SET medications="
      + mysql.escape(req.body.medications) + ", notes="
      + mysql.escape(req.body.notes) + " WHERE id="
      + mysql.escape(req.body.id);

    con.query(sql, function(err, result){
        if(err){
            console.log(err);
            res.writeHead(404,{
                'Content-Type' : 'text/plain'
            })
            res.end("Could not fetch patients");
        }
        else{
            res.setHeader('status', 200);
            res.json({success: "User updated in DB"});
        }
    });

});
//route to fetch the patient details from the DB and display it
app.get('/all_patients', function(req, res){
    var sql = "SELECT * FROM healthapp_patients";
    console.log("Get all patients");
    con.query(sql, function(err, result){
        if(err){
            console.log(err);
            res.writeHead(404,{
                'Content-Type' : 'text/plain'
            })
            res.end("Could not update user");
        }
        else{
            res.setHeader('status', 200);
            res.send(JSON.stringify(result));
        }
    });
    // con.end();
    console.log("Connected to DB to get all patients details");
});

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    console.log("HD Error", err);
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      console.log("HD PROTOCOL_CONNECTION_LOST", err);
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    connection = mysql.createConnection(connection.config);
    // handleDisconnect(connection);
    connection.connect();
  });
}

app.get('/', function(req, res){
    res.render("spa");
});

//express js server listening on 3000
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
