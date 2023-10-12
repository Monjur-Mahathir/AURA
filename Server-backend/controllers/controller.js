let {PythonShell} = require('python-shell');
var Personal = require('./../models/Personal.js');
const passport = require('passport');
const {ensureAuthenticated} = require('./../config/auth.js');
const bcrypt = require('bcryptjs')
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var mongoose = require('mongoose');
const FitbitApiClient = require("fitbit-node");



var notification = require('./../notification.js');
notification();

module.exports = function(app){
  app.get('/',function(req,res){
    res.render('home');
  });

  app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
  });

  app.get('/register',function(req,res){
    res.render('register');
  });

  app.post('/register',urlencodedParser, function(req,res){

    const {uid, name, email, phone, pass} = req.body;
    let errors = [];
    if (!uid || !name || !email || !pass) {
      errors.push({ msg: 'Please enter all fields' });
    }
    if (pass.length < 4) {
      errors.push({ msg: 'Password must be at least 4 characters' });
    }
    if(errors.length > 0){
      res.render('register', {errors,uid,name,email,phone,pass});
      }
      else{
        Personal.find({userid:uid}, async(err,data) =>{
          if(err){
            res.send('Error Registering. Please Try Again')
          }
          if(data.length == 1){
            errors.push({ msg: 'User already exists' });
            res.render('register', {errors,uid,name,email,phone,pass});
          }
          else{
            var noti = {status: 'off'};
            //Hash Passowrd
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(pass, salt);

            var personOne = new Personal({userid:uid ,name:name, password:hashedPass, email:email, phone:phone, typeOfUser:'Patient', clientId: '', clientSecret: '', accessToken:'', fall_notification:noti, food_notification:noti, water_notification:noti, heart_notification:noti, movement_notification:noti, caregiver:'null', provider:'null', movement_baseline:1, water_intake_oz_baseline:1, food_intake_baseline:1, heart_rate_baseline:1, temperature_baseline:1, messages:[], virtual_buttons:  {checkup_button:0, fall_button:0, heart_rate_button: 0, water_button: 0, activity_button: 0}}).save(function(err){
              console.log(err);
            });
            res.render('home');
          }
        });
    }
  });

  app.get('/login',function(req,res){
    res.render('loginPage');
  });

  app.post('/login', urlencodedParser,(req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/'+ req.body.userid,
    failureRedirect: '/',
  })(req, res, next);
});

app.get("/fitbit_callback", (req, res) => {
	res.send("Call back");
});

app.get('/:id', ensureAuthenticated, function(req,res){
    if(req.params.id == req.user.userid || req.user.typeOfUser == 'Provider')
    {
      Personal.find({userid:req.params.id}, function(err,data){
        if(err){
          res.send("This account does not exist");
        }
        if(data.length == 1){
          if(data[0].typeOfUser == 'Patient'){
            var person = data[0];

            var client = new FitbitApiClient({
              clientId: data[0].clientId,
              clientSecret: data[0].clientSecret,
              apiVersion: '1.2' // 1.2 is the default
            });
            console.log("Inside id page request")
            var sed;
            var la;
            var fa;
            var va;
            var activecalories;
            var heart_rate;
            var steps;
            var calories;
            var meals;
            var water;

            client.get("/activities/heart/date/today/7d/15min.json", data[0].accessToken).then(results => {
              console.log(results[0]['activities-heart-intraday']);
              heart_rate = results[0]['activities-heart-intraday'].dataset;
              client.get("/activities/steps/date/today/7d/15min.json", data[0].accessToken).then(results1 => {
                steps = results1[0]['activities-steps-intraday'].dataset;
                client.get("/activities/calories/date/today/7d.json", person.accessToken).then(results2 => {
                  calories = results2[0]['activities-calories'][0].value;
                  client.get("/activities/minutesSedentary/date/today/7d.json", person.accessToken).then(results3 => {
                    sed = results3[0]['activities-minutesSedentary'][0].value;
                    client.get("/activities/minutesLightlyActive/date/today/7d.json", person.accessToken).then(results4 => {
                      la = results4[0]['activities-minutesLightlyActive'][0].value;
                      client.get("/activities/minutesFairlyActive/date/today/7d.json", person.accessToken).then(results5 => {
                        fa = results5[0]['activities-minutesFairlyActive'][0].value;
                        client.get("/activities/minutesVeryActive/date/today/7d.json", person.accessToken).then(results6 => {
                          va = results6[0]['activities-minutesVeryActive'][0].value;
                          client.get("/activities/activityCalories/date/today/7d.json", person.accessToken).then(results7 => {
                            activecalories = results7[0]['activities-activityCalories'][0].value;
                            console.log(heart_rate.length);
                            res.render('visual', {info:data[0], heart: heart_rate, steps: steps, calories: calories, sed: sed, la:la, fa: fa, va: va, activecalories: activecalories});
                          });
                        });
                      });
                    });
                  });
                });
               });
             });

          }
          else if(data[0].typeOfUser == 'Provider'){
            Personal.find({typeOfUser:'Patient', provider:req.params.id},function(errP,dataP){
              res.render('visualDoc', {info:data[0], patients:dataP});
            });
          }
          else if(data[0].typeOfUser == 'Caregiver'){
            Personal.find({typeOfUser:'Patient', caregiver:req.params.id},function(errP,dataP){
              res.render('visualCaregiver', {info:data[0], patients:dataP});
            });
          }
        }
      });
    }
    else{
      res.redirect('/');
    }

  });

  // app.get('/:id/getdata', function(req, res){
  //   var pass = req.query.pass;
  //   var id = req.query.id;

  app.post('/getdata', urlencodedParser, function(req, res){
    const adminId = req.body.adminId;
    const pass = req.body.pass;
    //console.log(pass)
    console.log(adminId)
    // console.log(req.body)
    var id = req.body.id;
    Personal.findOne({typeOfUser: 'Admin'}, function(errAdmin, admin){
      if(adminId != admin.userid){
        res.json({error:"Admin user id error: " + adminId + "Authentication Failed"});
      }
      bcrypt.compare(pass, admin.password, function(er, ress){
        if(er){
          res.json({error:"Admin password failed: Authentication Failed"});
        }
        if(ress){
          Personal.findOne({userid:id}, function(err, person){
            if(err){
              console.log("User id not found: Authentication Failed")
              res.json({error:"User id not found: Authentication Failed"});
            }
            var client = new FitbitApiClient({
              clientId: person.clientId,
              clientSecret: person.clientSecret,
              apiVersion: '1.2' // 1.2 is the default
            });
            if(req.body.type == "heart")
            {
              var fro = req.body.start;
              var to = req.body.end;

              var start_time;
              var end_time;
              let currentDate = new Date();
	      
	      console.log(currentDate);
	      console.log("Heart Rate Requested");

              if(to == "-1" && fro == "-1")
              {
                prev_min = 0
                if(currentDate.getMinutes() >= 1){
                  prev_min = currentDate.getMinutes() - 1;
                }
                else{
                  prev_min = currentDate.getMinutes();
                }
                end_time = currentDate.getHours() + ":" + currentDate.getMinutes();
                start_time = currentDate.getHours() + ":" + prev_min;
		start_time = "00:01";
                client.get("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json", person.accessToken).then(results => {
		  console.log(results);
                  console.log(results[0]['activities-heart']);
		  console.log("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json");
                  if(results[0]['activities-heart'][0].value != 0)
                  {
                    res.json({heart_rate:results[0]['activities-heart'][results[0]['activities-heart'].length - 1].value});
                  }
                  else{
                    start_time = "00:01";
                    end_time = currentDate.getHours() + ":" + currentDate.getMinutes();
                    client.get("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json", person.accessToken).then(results1 => {
		      console.log("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json");
		      console.log(results1[0]['activities-heart']);
                      if(results1[0]['activities-heart'][0].value != 0)
                      {
                        res.json({heart_rate:results1[0]['activities-heart-intraday']['dataset'][results1[0]['activities-heart-intraday']['dataset'].length - 1]});
                      }
                      else{
                        let currentDate = new Date();
                        end_time = "23:59";
                        start_time = "00:01";
                        currentDate.setDate(currentDate.getDate() - 1);
                        yr = currentDate.getYear() + 1900;
                        mn = currentDate.getMonth() + 1;
                        dt = currentDate.getDate();
                        if(mn < 10){
                          mn = "0" + mn;
                        }
                        if(dt < 10){
                          dt = "0"+dt;
                        }
                        dat = yr + "-" + mn + "-" +dt;
                        client.get("/activities/heart/date/"+dat+"/1d/1min/time/" + start_time + "/"+ end_time + ".json", person.accessToken).then(results2 => {
                        console.log("/activities/heart/date/"+dat+"/1d/1min/time/" + start_time + "/"+ end_time + ".json"); 
			console.log(results2[0]['activities-heart']);
			if(results2[0]['activities-heart'][0].value != 0)
                          {
                            res.json({heart_rate:results2[0]['activities-heart-intraday']['dataset'][results2[0]['activities-heart-intraday']['dataset'].length - 1]});
                          }
                          else{
                            let currentDate = new Date();
                            end_time = "23:59";
                            start_time = "00:01";
                            currentDate.setDate(currentDate.getDate() - 2);
                            yr = currentDate.getYear() + 1900;
                            mn = currentDate.getMonth() + 1;
                            dt = currentDate.getDate();
                            if(mn < 10){
                              mn = "0" + mn;
                            }
                            if(dt < 10){
                              dt = "0"+dt;
                            }
                            dat = yr + "-" + mn + "-" +dt;
                            client.get("/activities/heart/date/"+dat+"/1d/1min/time/" + start_time + "/"+ end_time + ".json", person.accessToken).then(results3 => {
                              console.log("/activities/heart/date/"+dat+"/1d/1min/time/" + start_time + "/"+ end_time + ".json");
				console.log(results3[0]['activities-heart']);
			      if(results3[0]['activities-heart'][0].value != 0)
                              {
                                res.json({heart_rate:results3[0]['activities-heart-intraday']['dataset'][results3[0]['activities-heart-intraday']['dataset'].length - 1]});
                              }
                              else{
                                res.json({heart_rate:'Fitbit Not Synced for 3 days'});
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                  });
              }
              else if (to != "-1" && fro == "-1")
              {
                end_time = to;
                client.get("/activities/heart/date/today/1d/1min/time/" + end_time +"/" + end_time +".json", person.accessToken).then(results => {
		  console.log("/activities/heart/date/today/1d/1min/time/" + end_time +"/" + end_time +".json");
                  console.log(results[0]['activities-heart']);
                  res.json({heart_rate:results[0]['activities-heart'][results[0]['activities-heart'].length - 1].value});
                  });

              }
              else if (to == "-2" && fro == "-2") 
              {

                let currentDate = new Date();
                let time = currentDate.getHours() + ":" + currentDate.getMinutes();
                var fifteenminutesbefore;

                if(currentDate.getMinutes() >= 15){
                  fifteenminutesbefore = currentDate.getHours() + ":" + (currentDate.getMinutes() - 15);
                }
                else{
                  fifteenminutesbefore = (currentDate.getHours() - 1) + ":" + (60 - (15 -currentDate.getMinutes()));
                }

                start_time = fifteenminutesbefore;
                end_time = time;

                client.get("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json", person.accessToken).then(results => {
                  
                  heart_rate_data = results[0]['activities-heart'][results[0]['activities-heart'].length-1].value;

                  if (heart_rate_data == 0) {
                    sixtyminutesbefore = (currentDate.getHours() - 1) + ":" + currentDate.getMinutes();
                    console.log("Made 60 min heart rate request: /activities/heart/date/today/1d/15min/time/" + fifteenminutesbefore + "/" + time +".json")
                    client.get("/activities/heart/date/today/1d/15min/time/" + sixtyminutesbefore + "/" + time +".json", person.accessToken).then(results => {
                    console.log("Client data for " + person.userid + " :" + results)  
                    heart_rate_data = results[0]['activities-heart'][0].value;
                    res.json({heart_rate:heart_rate_data});
                  });
                  } else {
                    res.json({heart_rate:heart_rate_data});

                  }
                
              });

              }
              else if (to == "-3" && fro == "-3")
              {
                let currentDate = new Date();
                let time = currentDate.getHours() + ":" + currentDate.getMinutes();
		console.log("This is for average");
                start_time = "09:00";
                end_time = time;
                client.get("/activities/heart/date/today/1d/15min/time/" + start_time +"/" + end_time +".json", person.accessToken).then(results => {
		  console.log("/activities/heart/date/today/1d/15min/time/" + start_time +"/" + end_time +".json");
                  console.log(results[0]['activities-heart']);
                  res.json({heart_rate:results[0]['activities-heart'][0].value});
                  });
              }

              else if(fro != "-1" && to != "-1")
              {
                start_time = fro;
                end_time = to;
                client.get("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json", person.accessToken).then(results => {
		  console.log("/activities/heart/date/today/1d/1min/time/" + start_time +"/" + end_time +".json")
		  cosole.log(results[0]['activities-heart']);
                  res.json({heart_rate:results[0]['activities-heart'][results[0]['activities-heart'].length - 1].value});
                  });
              }

            }
            else if (req.body.type == "steps") {
              client.get("/activities/steps/date/today/7d.json", person.accessToken).then(results => {
		console.log(results[0]['activities-steps']);
                res.json({steps:results[0]['activities-steps'][results[0]['activities-steps'].length - 1].value});
              });
            }
            else if (req.body.type == "sleep") {
              client.get("/sleep/date/today.json", person.accessToken).then(results => {
                console.log("We're in the sleep else if");
                console.log(results[0]['summary'].totalMinutesAsleep);
                res.json({sleep:results[0]['summary'].totalMinutesAsleep});
              });
            }
            else if (req.body.type == "calories") {

              client.get("/activities/calories/date/today/7d.json", person.accessToken).then(results => {
		console.log(results[0]['activities-calories']);
                res.json({calories:results[0]['activities-calories'][results[0]['activities-calories'].length - 1].value});
              });
            }
            else if (req.body.type == "food") {
              client.get("/foods/log/date/today.json", person.accessToken).then(results => {
		console.log(results[0]);
                res.json({num_of_meals:results[0].foods.length});
              });
            }
            else if (req.body.type == "water") {
              client.get("/foods/log/water/date/today.json", person.accessToken).then(results => {
		console.log(results[0]);
                res.json({water_intake_oz: results[0].summary.water/28.3495231});
              });
            }
            else if (req.body.type == "active") {
              var sed;
              var la;
              var fa;
              var va;
              var activecalories;
              client.get("/activities/minutesSedentary/date/today/7d.json", person.accessToken).then(results => {
		console.log(results[0]);
                sed = results[0]['activities-minutesSedentary'][results[0]['activities-minutesSedentary'].length - 1].value;
                client.get("/activities/minutesLightlyActive/date/today/7d.json", person.accessToken).then(results1 => {
		  console.log(results1[0]);
                  la = results1[0]['activities-minutesLightlyActive'][results1[0]['activities-minutesLightlyActive'].length - 1].value;
                  client.get("/activities/minutesFairlyActive/date/today/7d.json", person.accessToken).then(results2 => {
		    console.log(results2[0]);
                    fa = results2[0]['activities-minutesFairlyActive'][results2[0]['activities-minutesFairlyActive'].length - 1].value;
                    client.get("/activities/minutesVeryActive/date/today/7d.json", person.accessToken).then(results3 => {
		      console.log(results3[0]);
                      va = results3[0]['activities-minutesVeryActive'][results3[0]['activities-minutesVeryActive'].length - 1].value;
                      client.get("/activities/activityCalories/date/today/7d.json", person.accessToken).then(results4 => {
			console.log(results4[0]);
                        activecalories = results4[0]['activities-activityCalories'][results4[0]['activities-activityCalories'].length - 1].value;

                        res.json({minutesSedentary:sed, minutesLightlyActive: la, minutesFairlyActive: fa, minutesVeryActive:va, activityCalories: activecalories});
                      });
                    });
                  });
                });
              });

            }

          });
        }
        else{
          res.json({error: ress + " Admin password fail Authentication Failed"});
        }
      });
    });

  });

  app.get('/:id/notification', ensureAuthenticated, (req, res) => {

    if(req.user.typeOfUser == 'Provider' || req.user.typeOfUser == 'Caregiver' || req.user.typeOfUser == 'Admin')
    {
      Personal.find({userid:req.params.id}, function(err,data){
        if(err){

        }
        if(data.length == 1){
          res.json({ fall_noti: data[0].fall_notification, water_noti: data[0].water_notification, food_noti: data[0].food_notification, movement_noti: data[0].movement_notification, heart_noti: data[0].heart_notification});
        }
      });
    }
    else{
      res.redirect('/');
    }

  });

  app.get('/:id/clearNoti', ensureAuthenticated, (req, res) => {
    if( req.user.typeOfUser == 'Provider' || req.user.typeOfUser == 'Caregiver' || req.user.typeOfUser == 'Admin')
    {
      console.log(req.user.userid)
      if(req.query.type == 'fall'){
        var noti = {status:'off'}
        Personal.updateOne(
          {userid:req.params.id},
          {$set: {fall_notification:noti}},
          function(err){

          }
        );
      }
      if(req.query.type == 'water'){
        var noti = {status:'off'}
        Personal.updateOne(
          {userid:req.params.id},
          {$set: {water_notification:noti}},
          function(err){

          }
        );
      }
      if(req.query.type == 'food'){
        var noti = {status:'off'}
        Personal.updateOne(
          {userid:req.params.id},
          {$set: {food_notification:noti}},
          function(err){

          }
        );
      }
      if(req.query.type == 'movement'){
        var noti = {status:'off'}
        Personal.updateOne(
          {userid:req.params.id},
          {$set: {movement_notification:noti}},
          function(err){

          }
        );
      }
      if(req.query.type == 'heart'){
        var noti = {status:'off'}
        Personal.updateOne(
          {userid:req.params.id},
          {$set: {heart_notification:noti}},
          function(err){

          }
        );
      }
      res.redirect('/' + req.user.userid);
    }
    else{
      res.redirect('/');
    }
  });

  app.get('/:id/getNotification', (req, res) => {
    var pass = req.query.pass;
    var id = req.query.id;

    Personal.findOne({typeOfUser: 'Admin'}, function(errAdmin, admin){
      if(req.params.id != admin.userid){
        res.json({error:"Authentication Failed"});
      }
      bcrypt.compare(pass, admin.password, function(er, ress){
        if(er){
          res.json({error:"Authentication Failed"});
        }
        if(ress){
          Personal.find({userid:id}, function(err,data){
              if(err){
                res.json({error:"Authentication Failed"});
              }
              if(data.length == 1){
                res.json({ fall_noti: data[0].fall_notification, water_noti: data[0].water_notification, food_noti: data[0].food_notification, movement_noti: data[0].movement_notification, heart_noti: data[0].heart_notification});
              }
            });
        }
      });
    });

  });

  app.get('/:id/clearNotification', (req, res) => {

    var pass = req.query.pass;
    var id = req.query.id;

    Personal.findOne({typeOfUser: 'Admin'}, function(errAdmin, admin){
      if(req.params.id != admin.userid){
        res.json({error:"Authentication Failed"});
      }
      bcrypt.compare(pass, admin.password, function(er, ress){
        if(er){
          res.json({error:"Authentication Failed"});
        }
        if(ress){
          if(req.query.type == 'fall'){
              var noti = {status:'off'}
              Personal.updateOne(
                {userid:id},
                {$set: {fall_notification:noti}},
                function(err){

                }
              );
              res.json({status:"Done"});
            }
            if(req.query.type == 'water'){
              var noti = {status:'off'}
              Personal.updateOne(
                {userid:id},
                {$set: {water_notification:noti}},
                function(err){

                }
              );
              res.json({status:"Done"});
            }
            if(req.query.type == 'food'){
              var noti = {status:'off'}
              Personal.updateOne(
                {userid:id},
                {$set: {food_notification:noti}},
                function(err){

                }
              );
              res.json({status:"Done"});
            }
            if(req.query.type == 'movement'){
              var noti = {status:'off'}
              Personal.updateOne(
                {userid:id},
                {$set: {movement_notification:noti}},
                function(err){

                }
              );
              res.json({status:"Done"});
            }
            if(req.query.type == 'heart'){
              var noti = {status:'off'}
              Personal.updateOne(
                {userid:id},
                {$set: {heart_notification:noti}},
                function(err){

                }
              );
              res.json({status:"Done"});
            }
        }
      });
    });

  });



  app.get('/:id1/:id2/setprescription',ensureAuthenticated, function(req,res){
    if(req.params.id1 == req.user.userid && req.user.typeOfUser == 'Provider'){
    res.render('prescription',{from:req.params.id1,to:req.params.id2});
  }
  else{
    res.redirect('/');
  }
  });

  app.post('/:id1/:id2/setprescription',urlencodedParser, function(req,res){
    var to = req.body.to;
    var actype = req.body.actype;
    var lowamount = req.body.lowamount;
    var highamount = req.body.highamount;
    var amount = (lowamount + highamount) / 2;

    if(actype=='heart_rate'){
      Personal.update(
        {userid:req.body.to},
        {$set: { heart_rate_baseline_low:lowamount }},
        function(err){

        }
      );
      Personal.update(
        {userid:req.body.to},
        {$set: { heart_rate_baseline_high:highamount }},
        function(err){

        }
      );
      res.redirect('/'+req.body.from);
    }

    else if(actype=='food_intake'){
      Personal.update(
        {userid:req.body.to},
        {$set: { food_intake_baseline:amount }},
        function(err){

        }
      );
      res.redirect('/'+req.body.from);
    }
    else if(actype=='water_intake_oz'){
      Personal.update(
        {userid:req.body.to},
        {$set: {water_intake_oz_baseline:amount }},
        function(err){

        }
      );
      res.redirect('/'+req.body.from);
    }
    else if(actype=='movement'){
      Personal.update(
        {userid:req.body.to},
        {$set: { movement_baseline_low:lowamount }},
        function(err){

        }
      );
      Personal.update(
        {userid:req.body.to},
        {$set: { movement_baseline_high:highamount }},
        function(err){

        }
      );
      res.redirect('/'+req.body.from);
    }

  });


  //Other stuff
  app.get('/:id1/:id2/message',ensureAuthenticated, function(req,res){
    if(req.params.id1 == req.user.userid){
      res.render('sendmsg',{from:req.params.id1,to:req.params.id2});
    }

  });

  app.post('/:id1/:id2/message',urlencodedParser, function(req,res){
    var m = {from:req.body.from, msg:req.body.msg};

    Personal.update(
      {userid:req.body.to},
      {$push: {messages:m}},
      function(err){

      }
    );
    res.redirect('/'+req.body.from);
  });

  app.post('/:id1/:id2/message',urlencodedParser, function(req,res){
    var m = {from:req.body.from, msg:req.body.msg};

    Personal.update(
      {userid:req.body.to},
      {$push: {messages:m}},
      function(err){

      }
    );
    res.redirect('/'+req.body.from);
  });

  // Method for Alexa to report anything reported by the user and any requests made
    app.post('/addevent', urlencodedParser, function(req, res){
      const adminId = req.body.adminId;
      const pass = req.body.pass;
      console.log(pass)
      console.log(adminId)
      console.log(req.body)
      var id = req.body.id;
      var textBool = req.body.textBool;
      Personal.findOne({typeOfUser: 'Admin'}, function(errAdmin, admin){
        if(adminId != admin.userid){
          res.json({error:"Admin user id error: " + adminId + "Authentication Failed"});
        }
        bcrypt.compare(pass, admin.password, function(er, ress){
          if(er){
            res.json({error:"Admin password failed: Authentication Failed"});
          }
          if(ress){
            Personal.findOne({userid:id}, function(err, person){
              if(err){
                console.log("User id not found: Authentication Failed")
                res.json({error:"User id not found: Authentication Failed"});
              }
              var client = new FitbitApiClient({
                clientId: person.clientId,
                clientSecret: person.clientSecret,
                apiVersion: '1.2' // 1.2 is the default
              });
              //if(req.body.type == "heart")
              console.log("User event detected for: " + id + ".  event:  " + req.body.event);
              var event = {time: new Date(), event: "User event detected: " + req.body.event};
              
              
              const accountSid = 'AC612c14bfeffaff85918005bccb40a50c'; 
              const authToken = '0d257a258c21e31aa0cfbf9f3be6674b'; 
              const textclient = require('twilio')(accountSid, authToken); 
              
              for (var i = 0; i < person.caregiver.length; i++) {
                var caregiverID = person.caregiver[i];
                Personal.findOne({userid:caregiverID}, function(err, caregiver){
                  if(err){
                    console.log("User id not found: Authentication Failed")
                    res.json({error:"User id not found: Authentication Failed"});
                  }
                  var caregiverNumber = caregiver.phone;
                  var caregiverEmail = caregiver.email;
                  if (textBool == 'true') {
                  textclient.messages 
                        .create({ 
                          body: 'User: ' + id + ' asked to contact caregiver: ' + event.event,  
                          messagingServiceSid: 'MG4ca33a26f8e97b2500123d06048edc8d',      
                          to: caregiverNumber
                        }) 
                        .then(textmessage => console.log(textmessage.sid)) 
                        .done();
                  }
                  if (id == 'patient3') {
                    textclient.messages 
                          .create({ 
                            body: 'An event was detected for User: ' + id + '. They did not ask to contact caregiver.: ' + event.event,  
                            messagingServiceSid: 'MG4ca33a26f8e97b2500123d06048edc8d',      
                            to: caregiverNumber
                          }) 
                          .then(textmessage => console.log(textmessage.sid)) 
                          .done();
                    }


                    
                  });
                }

                // Don't add a duplicate event if we are just texting
              if (textBool == 'false') {
              Personal.updateOne(
                {userid:person.userid},
                {$push: {events: event}},
                function(err1){
            
                });
              }
              res.json({status:"Done"});
              });
          }
          else{
            res.json({error: ress + " Admin password fail Authentication Failed"});
          }
        });
      });
  
    });
}
