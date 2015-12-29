var rootPath = process.cwd();

var nodemailer = require("nodemailer"),
    EmailVerifToken = require(rootPath + '/models/emailVerifToken'),
    User = require(rootPath + '/models/user'),
    ObjectId = require('mongoose').Types.ObjectId,
    uuid = require('node-uuid');

var smtpTransport = require('nodemailer-smtp-transport');

var express = require('express'),
	router = express.Router();


function sendVerificationEmail(email, callback){
    User.findOne({  $or:[ {'username': email.toLowerCase()}, {'email': email.toLowerCase()}, {'displayName': email.toLowerCase() } ] }, function(err, user) {
	        if (err){
            callback(err);
        }  
        if (!user){
            //Account doesn't exist
            callback(new Error("002"));
        }
        console.log(user);
        //Create rand token
        var token = new EmailVerifToken({
            userId : user.userId,
            email : user.email,
            verifToken:  uuid.v4()
        });

        var link="http://api.drez.io/email/verify?id="+token.verifToken;

        //Save on database
        token.save(function(err, token) {
            if(err) {
                callback(err);
            }else {

                /*
                    Here we are configuring our SMTP Server details.
                    STMP is mail server which is responsible for sending and recieving email.
                */
                var transport = nodemailer.createTransport(smtpTransport({
                    host: 'ssl0.ovh.net',
                    secureConnection: false, // use SSL
                    port: 587, // port for secure SMTP
                    auth: {
                        user: "flanglet@dresstime.io",
                        pass: "57Loge52S"
                    }
                }));
                
                //Create Email
                mailOptions={
                    to : user.email,
                    from: "flanglet@dresstime.io",
                    subject : "Please confirm your Email account",
                    html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
                }
                console.log("Email Sending");
                //Send it
                transport.sendMail(mailOptions, function(error, response){
                    console.log("sendMail");
                    if(error){
                        console.log(error);
                        callback(error);
                    }else{
                        console.log("Email Send");
                        callback(null,  response.message)
                    }
                }); 
            }
        });
    });
};


function checkTokenIsValid(verifToken, callback){
     EmailVerifToken.findOne({verifToken: verifToken}, function(err, verifToken){
        if(err) { 
            callback(err); 
        } else {
            console.log(verifToken.userId);
            User.update({_id: new ObjectId(verifToken.userId)} , {isVerified : true}, {multi: true}, function (err, numAffected) {
                if (err){
                    callback(err);
                } else {
                    console.log(numAffected);
                    verifToken.remove();
                    callback(null, 'Account verified successfully');
                }
            });
        }
    });
};


router.get('/send',function(req,res){
    sendVerificationEmail(req.query.email, function(err, result){
        console.log(err);
        res.send(result);                                                               
    });
});

router.get('/verify',function(req,res){
    checkTokenIsValid(req.query.id, function(err, result){
        res.send(result);
    });
    /*console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if(req.query.id==rand) {
            console.log("email is verified");
            res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
        } else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
    else {
        res.end("<h1>Request is from unknown source");
    } */
});

module.exports = router;