 var send_notification = require('./send_notification.js');
var Personal = require('./models/Personal.js');
let {PythonShell} = require('python-shell');
const FitbitApiClient = require("fitbit-node");

module.exports= async function() {

  var nightUpdate = 10 * 60 * 60 * 1000; // Every 10 hours (may change to constant time)
  setInterval(async function(){
    var water_val;
    var food_val;
    var baseline = [];
    let currentDate = new Date();
    if(currentDate.getHours() == 20 && currentDate.getMinutes() <= 10 ){

      var persons = await Personal.find({typeOfUser:'Patient'});
      persons.forEach(async person => {
        var client = new FitbitApiClient({
          	clientId: person.clientId,
          	clientSecret: person.clientSecret,
          	apiVersion: '1.2' // 1.2 is the default
          });
        clientData1 = await client.get("/foods/log/water/date/today.json", person.accessToken);
        water_val = clientData1[0].summary.water/28.3495231;

        clientData2 = await client.get("/foods/log/date/today.json", person.accessToken);
        food_val = clientData2[0].foods.length;



        baseline.push(person.water_intake_oz_baseline);
        baseline.push(person.food_intake_baseline);

        var options = {
          mode: 'text',
          pythonOptions: ['-u'],
          scriptPath: './api/',
          args: [water_val, food_val, baseline]
        };

        PythonShell.run('other.py', options, function (err, results) {
          if (err) {
            console.log(err);
          }

          if(results[0]=="False"){
            var noti = {status: 'on', time: new Date()};
            Personal.updateOne(
                {userid:person.userid},
                {$set: {water_notification: noti}},
                function(err1){

                }
              );
          }
          if(results[1]=="False"){
            var noti = {status: 'on', time: new Date()};
            Personal.updateOne(
                {userid:person.userid},
                {$set: {food_notification: noti}},
                function(err2){

                }
              );
          }
          else{

          }
        });
    });
  }
  }, nightUpdate);


  var hourlyUpdate = 2 * 60 * 60 * 1000;  // Every 2 hours

  setInterval(async function(){
    var steps;
    var baseline;
    let currentDate = new Date();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes();
    let twohoursbefore = (currentDate.getHours() - 2) + ":" + currentDate.getMinutes();

    if(currentDate.getHours() <= 20 && currentDate.getHours() >= 8){

      var persons = await Personal.find({typeOfUser:'Patient'});
      persons.forEach(async person => {
        var client = new FitbitApiClient({
          	clientId: person.clientId,
          	clientSecret: person.clientSecret,
          	apiVersion: '1.2' // 1.2 is the default
          });
        clientData = await client.get("/activities/minutesSedentary/date/today/1d/15min/time/" + twohoursbefore + "/" + time +".json", person.accessToken);

        steps = clientData[0]['activities-minutesSedentary'][0].value;
        baseline_low = person.movement_baseline_low;

        var options = {
          mode: 'text',
          pythonOptions: ['-u'],
          scriptPath: './api/',
          args: [steps, baseline_low]
        };

        PythonShell.run('movement.py', options, function (err, results) {
          if (err){
            console.log(err);
          }

          if(results[0]=="False"){
            var noti = {status: 'on', time: new Date()};
            Personal.updateOne(
                {userid:person.userid},
                {$set: {movement_notification: noti}},
                function(err1){

                }
              );

              console.log("User event detected for: " + person.userid + ".  event:  low movement");
              var event = {time: new Date(), event: "User event detected: low step count of: " + steps};
                
              stepRateButtonNum = person.activity_button;
              send_notification(stepRateButtonNum);
              console.log('Button num: ' + stepRateButtonNum + ' for patient ' + person.userid)

              Personal.updateOne(
                {userid:person.userid},
                {$push: {events: event}},
                function(err1){
            
                });
          }
          else{
              
          }
        });
    });

    }

  }, hourlyUpdate);


var secondUpdate = 1 * 30 * 60 * 1000;  // Every 1 hour

setInterval(async function(){
  var heart_rate;
  var baseline;
  let currentDate = new Date();
  console.log(currentDate)
  let time = currentDate.getHours() + ":" + currentDate.getMinutes();
  var fifteenminutesbefore;

  if(currentDate.getMinutes() >= 15){
    fifteenminutesbefore = currentDate.getHours() + ":" + (currentDate.getMinutes() - 15);
  }
  else{
    fifteenminutesbefore = (currentDate.getHours() - 1) + ":" + (60 - (15 -currentDate.getMinutes()));
  }
  if(currentDate.getHours() <= 20 && currentDate.getHours() >= 8){
  //if(true){

    var persons = await Personal.find({typeOfUser:'Patient'});
    persons.forEach(async person => {
      var client = new FitbitApiClient({
        	clientId: person.clientId,
        	clientSecret: person.clientSecret,
        	apiVersion: '1.2' // 1.2 is the default
        });
      console.log("Running 15 minute update on " + person.userid)
      clientData = await client.get("/activities/heart/date/today/1d/15min/time/" + fifteenminutesbefore + "/" + time +".json", person.accessToken);
      console.log("Made 15 min heart rate request: /activities/heart/date/today/1d/15min/time/" + fifteenminutesbefore + "/" + time +".json")
      console.log("Client data for " + person.userid + " :" + JSON.stringify(clientData[0]))
      
      try {
      heart_rate = clientData[0]['activities-heart'][0].value;
      }
      catch (TypeError) {
        console.log("Fitbit API call failed")
        return;
      }

      if (heart_rate == 0) {
        sixtyminutesbefore = (currentDate.getHours() - 1) + ":" + currentDate.getMinutes();
        console.log("Made 60 min heart rate request: /activities/heart/date/today/1d/15min/time/" + fifteenminutesbefore + "/" + time +".json")
        clientData = await client.get("/activities/heart/date/today/1d/15min/time/" + sixtyminutesbefore + "/" + time +".json", person.accessToken);
        console.log("Client data for " + person.userid + " :" + clientData)  
        heart_rate = clientData[0]['activities-heart'][0].value;

      }
      baseline_low = person.heart_rate_baseline_low;
      baseline_high = person.heart_rate_baseline_high;
      console.log(person.userid + ": heart-rate : " + heart_rate)

      var options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: './api/',
            args: [heart_rate, baseline_low, baseline_high]
          };

      PythonShell.run('heart.py', options, function (err, results) {
        if (err) {
          console.log(err);
        }
        console.log(person.userid + " : Python heart.py results: " + results)

        if(results != null && results[0]=="False"){
        var noti = {status: 'on', time: new Date()};

        Personal.updateOne(
          {userid:person.userid},
          {$set: {heart_notification: noti}},
          function(err1){

          }
        );
        if (heart_rate != 0) {
        console.log("User event detected for: " + person.userid + ".  event:  abnormal heart rate");
        var event = {time: new Date(), event: "User event detected: abnormal heart rate of: " + heart_rate};
        Personal.updateOne(
          {userid:person.userid},
          {$push: {events: event}},
          function(err1){
      
          });
        }
        // Find the person's correct Virtual Button number for the heartRateIntent on Amazon Alexa
        heartRateButtonNum = person.virtual_buttons.heart_rate_button;
        send_notification(heartRateButtonNum);
        console.log('Button num: ' + heartRateButtonNum + ' for patient ' + person.userid)
      }
      else{

      }
    });
  });
}


}, secondUpdate);




var halfHourUpdate = 1 * 45 * 60 * 1000;  // Every 45 minutes check for daily update

setInterval(async function(){
  var heart_rate;
  var baseline;
  let currentDate = new Date();
  console.log(currentDate)
  let time = currentDate.getHours() + ":" + currentDate.getMinutes();
  var fifteenminutesbefore;

  if(currentDate.getMinutes() >= 15){
    fifteenminutesbefore = currentDate.getHours() + ":" + (currentDate.getMinutes() - 15);
  }
  else{
    fifteenminutesbefore = (currentDate.getHours() - 1) + ":" + (60 - (15 -currentDate.getMinutes()));
  }

  if (currentDate.getHours() == 7 || currentDate.getHours() == 19) {
    console.log("Starting Daily Checkup")
    var persons = await Personal.find({typeOfUser:'Patient'});
    persons.forEach(async person => {
      var client = new FitbitApiClient({
          clientId: person.clientId,
          clientSecret: person.clientSecret,
          apiVersion: '1.2' // 1.2 is the default
        });
    checkupRateButtonNum = person.virtual_buttons.checkup_button;
    send_notification(checkupRateButtonNum);
    console.log('Button num: ' + checkupRateButtonNum + ' for patient ' + person.userid)
  });
  }
}, halfHourUpdate);


}




