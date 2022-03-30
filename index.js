/*
  RESTFul Services by NodeJs
  Author: raed mejri
  Update: 03/01/2022
 */


var crypto = require('crypto');
var uuid = require('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

// Connect to MySQL
var con = mysql.createConnection({
    host: 'localhost', // Replace your HOST IP
    user: 'root',
    password: '',
    database:'DemoNodeJS1'
});

//PASSWORD CRYPT
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') //Convert to hexa format
        .slice(0,length);

};

var sha512 = function (password,salt) {
    var hash = crypto.createHmac('sha512',salt) ; //Use SHA512
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };

};
function saltHashPassword(userPassword) {
    var salt = genRandomString(16); //Gen Random string with 16 charachters
    var passwordData = sha512(userPassword,salt) ;
    return passwordData;

}
function checkHashPassword(userPassword,salt) {
    var passwordData = sha512(userPassword,salt);
    return passwordData;

}




var app = express();
var port=3000;
var multer, storage, path, crypto;
multer = require('multer')
path = require('path');
var ima = "";
app.use(bodyParser.json()); //Accept JSON Params
app.use(bodyParser.urlencoded({ extended: true })); // Accept URL Encoded params
const pool =mysql.createPool({
connectionLimit :10,
host            :'localhost',
user            : 'root',
password        : '',
database        : 'DemoNodeJS1'

})


var form = "<!DOCTYPE HTML><html><body>" +
    "<form method='post' action='/upload' enctype='multipart/form-data'>" +
    "<input type='file' name='upload'/>" +
    "<input type='submit' /></form>" +
    "</body></html>";
    console.log('base de donnée connecter');
app.get('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(form);
    

});

// Include the node file module
var fs = require('fs');

storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        return crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) {
                return cb(err);
            }
            return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
        });
    }
});



// Post files
app.post(
    "/upload",
    multer({
        storage: storage
    }).single('upload'), function (req, res) {
        console.log(req.file);
        console.log(req.body);
        res.redirect("/uploads/" + req.file.filename);
        console.log(req.file.filename);
        ima = req.file.filename;
        console.log(photo_evenement);
        return res.status(200).end();
    });


app.get('/uploads/:upload', function (req, res) {
    file = req.params.upload;
    console.log(req.params.upload);
    var img = fs.readFileSync(__dirname + "/uploads/" + file);
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(img, 'binary');

});

app.post('/register/', (req, res, next) => {
    var post_data = req.body; // Get POST params
    var uid = uuid.v4(); // Get UUID  V4 like '110abacsasas-af0x-90333-casasjkajksk
    var plaint_password = post_data.password; // Get Password from POST params
    var hash_data = saltHashPassword(plaint_password);
    var password = hash_data.passwordHash; // Get hash value
    var salt = hash_data.salt; // Get salt 
    var name = post_data.name;
    var email = post_data.email;
    var adress = post_data.adress;
    var phone = post_data.phone
    var imaa = post_data.imaa;
    con.query('SELECT * FROM user where email=?', [email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MySQL ERROR]');
        });
        if (result && result.length)
            res.json('User already exists!!!');
        else {
            con.query('INSERT INTO `User`(`unique_id`, `name`, `email`, `encrypted_password`, `salt`, `created_at`, `updated_at`,`adress`,`phone`,`imaa`) VALUES(?, ?, ?, ?,?, NOW(), NOW(),?,?,?)',
           [uid, name, email, password, salt,adress,phone,ima], function(err, result, fields) {
                    con.on('error', function (err) {
                        console.log('[MySQL ERROR]', err);
                        res.json('Register Error: ', err);

                    });

                    res.json('Register Successful!');
        })
        }
    });
   
})

app.post('/login/', (req, res, next) => {
    var post_data = req.body;

    // Extract email and password from request
    var user_password = post_data.password;
    var email = post_data.email;
    con.query('SELECT * FROM user where email=?', [email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MySQL ERROR]');
        });
        if (result && result.length)

               {
                   var salt = result[0].salt;
                   var encrypted_password = result[0].encrypted_password;
                   var hashed_password = checkHashPassword(user_password, salt).passwordHash;
                  // console.log(encrypted_password);
                   //console.log(hashed_password);
               if (encrypted_password == hashed_password)
                  res.end(JSON.stringify(result[0]))
                 // res.end( JSON.stringify('bien'))

               else
                   res.end(JSON.stringify('Mot De Passe Incorrecte'))


               }

               else {

                       res.json('Utilisateur introuvable');

                   }

    });

})




//GET CLIENT:BEGIN
app.get('/user/:email', (req, res, next) => {
    con.query('SELECT * FROM user where email=?', [req.params.email], function (err, result, fields) {
        con.on('error', function (err) {
            console.log('[MYSQL ERROR]', err);
        });
        if (result && result.length) {
            res.end(JSON.stringify(result[0]));
        }
        else {
            res.end(JSON.stringify("error"));
        }

    });
})






app.put('/UpdateProfil/:id', (req, res, next) => {
    var post_data = req.body;  //Get POST params
    var id = req.params.id;
   var name = post_data.name;
       var email = post_data.email;
       var adress = post_data.adress;
       var phone = post_data.phone

    con.query('UPDATE `user` SET `name`=?,`email`=?,`updated_at`=NOW(),`adress`=?,`phone`=? WHERE id=?',
        [name,email,adress,phone, id], function (err, result, fields) {
            if (err) throw err;

            res.json('profile updated with success !');

        })

})

app.get('/consultationpatient',(req,res)=>{
    con.query('SELECT nom ,lastname,phone FROM consultation',(err,rows,fields)=>
    {
    if(!err){
    res.send(rows);
    
    }
    
    else
    {
    throw err;
    }
    });
    })





    app.put('/consultationupdate/:id', (req, res, next) => {
        
       var post_data=req.body
       var id= req.params.id
           var Nompatient = post_data.Nompatient;
           var prenompatient =post_data.prenompatient;
           var numero=post_data.numero;
           var time=post_data.time;
           var date=post_data.date;
        

        con.query('UPDATE `consultation` SET `nom`=?,`lastname`=?, `phone`=?,`time`=?,`date`=? WHERE idc=?',
            [Nompatient,prenompatient,numero,time,date,id], function (err, result, fields) {
             //console.log(result)
                if (err) throw err;
                
             
                       res.json('rendez vous updated with success !');
    
            })
        })
    
    





app.get('/consultation', (req, res) => {

    
    con.query('SELECT * from consultation ', function (err, rows, fields) {
        if(!err){
            //console.log(rows)
            res.send(rows);
        }
            
            else
            {
            throw err;
            }

     });
 })



 app.get('/consultation/:date', (req, res, next) => {
    con.query('SELECT nom ,lastname , phone,idc ,time  ,date  from consultation where date=?', [req.params.date], function (err, rows, fields) {
        if(!err){
        
            res.send(rows);
        }
            
            else
            {
            throw err;
            }
    });
})





app.delete('/delete/:id',(req, res, next) => {
    con.query('DELETE from consultation where consultation.idc=?'
    ,[req.params.id], function (err, result, fields) {
        //console.log(result)
        if (err) throw err;
        res.json('patient and consultation supprimer avec succès !');

    });
})

app.post('/addconsultationpatient/',(req,res,next)=>{
    var post_data = req.body;  //Get POST params

    //var titre = post_data.addrequest;

var Nompatient = post_data.Nompatient;
var prenompatient =post_data.prenompatient;
var numero=post_data.numero;
var time=post_data.time;
var date=post_data.date;

 con.query('INSERT INTO `consultation` (`nom`, `lastname`, `phone` ,`time`, `date`) ' +
        'VALUES (?,?,?,?,?)',[Nompatient,prenompatient,numero,time,date],function (err,result,fields) {
                           if (err) throw err;
                                  
                
                res.json('patient ajouté avec succès !');

    });

})




// Start Server
app.listen(port, () => {
    console.log('server  running');

})
