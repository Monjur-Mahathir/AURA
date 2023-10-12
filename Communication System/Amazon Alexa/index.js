/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const axios = require('axios');

//TODO: make state and event patient specific with a HashMap (this way multiple patients and interact at the same time)
var state = 'initial';
var initial_message = '';
var event = 'general';
var userid = '';
var textBool = 'false';
const useridMap = new Map();
//Dev Echo (Patient 1)
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJZNRYVO2JGPMM5ENMSNTQWC6KJMTPQLK3U2BTQPQKTO4UYQZCU6KI7O3EKBQJGXTBV2BE56JLCI22JNROVEJKIONF4TWLEZEDYMTZE5HQOEN5LXY6TB6GCYX476C6ALTLSR67HISO2YKN5NEXX4SOA42VOU', 'patient1');

// This is the device id for "test" using the console 
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJ3M5YUDEET3ZFLWMKBO5DG4W33E2VXHXTEVDXOR35HCKQVBS46UCAFFAFIEYA2HX5MG4PEFJ23JBRRCTUZTDE2XGZ75OCYKAH4GV5GAURGZZXVHFDVFXLJDLJYEKLTMEOFAS2XTNQZBSM5RJXLLEPVYTD52', 'patient3');

// This is device id for Patient 2 echo
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJ6EMZYDCHAB2ACCJSGAESCN6UV2SU6NBZJPWTWS55IRG3UPONLSEWSOKABNDMMJ5RJQ2K3X6W7CJLKXF765WVTLK7JVUTYCZ4IAFEJOS4GU4HPOIOPCJLT6D5AYNMHGL2ABF4LGBKI7YW7QRAH5XI2W3ZSQ', 'patient2')

// This is the device id for Patient 3 echo
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJREJURT4G7GQ5MYNTVACINIULHK72PRFHARLVAEE2UNZIIP573KTNY2GQKDLCHA5AOHOXOXXV4BAMCWMA26GFAILUWCPZ4AIDXPU2LYT3PXC4E6E7OGF2Q7BDKHFJOUXLLBXFNFGOW6ZNET656H7RHMNGKW', 'patient3')

// This is the device id for Patient 4 echo
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJVHYHZWGUQDNLW4QUYTOMMLASTNSGGWIGCR3COHUXXXUW63YUBUIFP6FDASYBRJRVB3OW22KQQJW5CCVBFTTM72RVDLVDOPS74HSUXE5SKYVRJZQII5SFRNJR5JMK3I42MPQTCY73OZOGZNQWS2G5VSWKCI', 'patient4')

// This is the device id for Patient 5 echo
useridMap.set('amzn1.ask.device.AEHAX42FDK2JDJFZIFZS77BYKVJUA553HOPOJBU4H2QOWUMWJXYJQO5BPQEHAEWZ3HNMJD6OHOUE5KJA4X5D7OAGEXHV64SC2D5LEJH623ZUOSZNCTN5YUYVZKA34BWA5VVTYD2L2BBTJ434FK6FIAYQD44BUX6WPWFBNDZM7UID3P55C3XOI', 'patient5')

//const userid = 'patient1lab'
//const password = 'Tarheels256!'

const dehydratedTips = [];
const fatigueTips = [];


const getRemoteData = function (pType, userid, pStart, pEnd) {
    return new Promise((resolve, reject) => {
    axios
  .post('https://peoject-aura.herokuapp.com/getdata','adminId=auraAdmin&pass=Tarheels256!&type='+pType+'&id='+userid+'&start='+pStart+'&end='+pEnd)
  .then(response => {
    console.log(`statusCode: ${response.status}`)
    console.log(response)
    resolve(response)
  })
  .catch(error => {
    console.error(error)
    reject(error)
    
  })
    })

};

const pushRemoteData = function (currentEvent, userid) {
    return new Promise((resolve, reject) => {
    axios
  .post('https://peoject-aura.herokuapp.com/addevent','adminId=auraAdmin&pass=Tarheels256!&event='+currentEvent+'&id='+userid+'&textBool='+textBool)
  .then(response => {
    console.log(`statusCode: ${response.status}`)
    console.log(response)
    resolve(response)
  })
  .catch(error => {
    console.error(error)
    reject(error)
    
  })
    })

};




const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Opening the aura medical app. Want to you want to check? If you are feeling bad, just say "check up" or say a specific symptom.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const WoundIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WoundIntent';
    },
    async handle(handlerInput) {
        const speakOutput = 'Would you like me to contact your caregiver?';
        event = 'wound';
        state = 'caregiver';
        
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        var currentEvent = "Wound or pain reported";
        await pushRemoteData(currentEvent, userid)
          .then((response) => {
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FatigueIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FatigueIntent';
    },
    async handle(handlerInput) {
        
        const speakOutput = 'Would you like me to contact your caregiver?';
        event = 'fatigue';
        state = 'caregiver';
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        var currentEvent = "Fatigue reported";
        await pushRemoteData(currentEvent, userid)
          .then((response) => {
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



const CheckUpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckUpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'How are you feeling today? Please tell me if you feel tired, dehydrated, hurt, slow, or if you are feeling fine.';
        event = 'general';
        state = 'initial';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//TODO: Need to handle the Yes/NoIntents for the falls
const FallIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FallIntent';
    },
    async handle(handlerInput) {
        const speakOutput = 'We detected a fall. Did you fall?';
        event = 'fall';
        state = 'initial';
        
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        var currentEvent = "Fall reported";
        await pushRemoteData(currentEvent, userid)
          .then((response) => {
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AbnormalHeartRateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AbnormalHeartRateIntent';
    },
    async handle(handlerInput) {
        
        // First check if fitbit needs refresh
        console.log("Starting abnormal heart rate")
        var heart_rate;
        let currentDate = new Date();
        let start = "-2";
        var end = "-2";
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        userid = useridMap.get(device_id);
        
        
        //console.log('https://peoject-aura.herokuapp.com/auraAdmin/getdata?type=heart&id=' + userid + '&pass=' + password + '&start='+start+'&end='+end)
        
        await getRemoteData('heart', userid, start, end)
          .then((response) => {
              // {"heart_rate":{"time":"23:21:00","value":63}}
            console.log(response)
            const data = response.data;
            console.log(data)
            //speakOutput += data.heart_rate;

            //speakOutput += '${data.heart_rate}';
            heart_rate = data.heart_rate;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
          
          console.log("Got remote data " + heart_rate)
          
          
          
          var speakOutput;
          if (heart_rate === '0') {
            console.log("Heart rate of 0 detected")
            speakOutput = 'We could not find a heart rate for you. Please refresh the Fitbit app on your phone.';
            event = 'general';
            state = 'initial';
            console.log(typeof(currentDate.getHours()))
            console.log(currentDate.getHours())

            if  (21 < currentDate.getHours() ||  currentDate.getHours() < 8) {
                console.log("Out of current running times")
                speakOutput = ''
            }
             return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
              
          } else {
          
        
        speakOutput = 'We detected abnormal heart rate levels. Do you feel alright?';
        event = 'abnormal heart rate';
        state = 'initial';
         return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
          }
    }
};

const LowStepIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LowStepIntent';
    },
    async handle(handlerInput) {
        
        // First check if fitbit needs refresh
        console.log("Starting low step count")
        var steps;
        let currentDate = new Date();
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        userid = useridMap.get(device_id);
        
        
        //console.log('https://peoject-aura.herokuapp.com/auraAdmin/getdata?type=heart&id=' + userid + '&pass=' + password + '&start='+start+'&end='+end)
        
        await getRemoteData('step', userid, 0, 0)
          .then((response) => {
              // {"heart_rate":{"time":"23:21:00","value":63}}
            console.log(response)
            const data = response.data;
            console.log(data)

            steps = data.steps;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
          
          console.log("Got remote data " + steps)
          
          
          
          var speakOutput;
          if (steps === '0') {
             console.log("Step count of 0 detected")
            speakOutput = 'We could not find a step count for you. Please refresh the Fitbit app on your phone.';
            event = 'general';
            state = 'initial';
            
            if  (21 < currentDate.getHours() < 8) {
                speakOutput = ''
            }
            
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
              
              
          }
          
        
        
        
        speakOutput = 'We detected low step count. Try to walk around a little bit to remain healthy?';
        event = 'low step';
        state = 'initial';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



const DehydrationIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DehydrationIntent';
    },
    async handle(handlerInput) {
        const speakOutput = 'Has your urine been very darkly colored?';
        event = 'dehydration';
        state = 'initial';
        
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        var currentEvent = "Dehydration reported";
        await pushRemoteData(currentEvent, userid)
          .then((response) => {
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'YesIntent';
    },
    async handle(handlerInput) {
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        var currentEvent = "";
        let speakOutput = '';
        
        if(state==='initial'){
            if(event==='dehydration'){
                state = 'urine_blood';
                speakOutput = 'Have you noticed blood in your urine?';
            }
            else if(event==='fall'){
                state = 'caregiver';
                speakOutput = 'If this is an emergency, please call nine one one. '
                speakOutput += 'I will contact your caregiver. Would you like me to notify your provider?';
            }
             else if(event==='abnormal heart rate'){
                state = 'caregiver';
                speakOutput = 'Okay good. Would you still like me to contact your caregiver?';
            }
        }
        
        else if(state==='urine_blood'){
            userid = useridMap.get(device_id);
            currentEvent = "Blood in urine reported";
            await pushRemoteData(currentEvent, userid)
              .then((response) => {
              })
              .catch((err) => {
                //set an optional error message here
                //outputSpeech = err.message;
              });
                event = 'UTI';
                state = 'caregiver';
                speakOutput = 'Would you like me to contact your caregiver?';
            }
            
        else if(state==='caregiver'){
            
            // Only text when they ask to contact care giver. Otherwise it will email
            textBool = 'true'
            userid = useridMap.get(device_id);
            await pushRemoteData(event, userid)
            .then((response) => {
            })
            .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
            });
            textBool = 'false'
            state = 'provider';
            speakOutput = 'If this is an emergency, please contact nine one one.'
            speakOutput += 'I will contact your caregiver. Would you like me to notify your provider?';
        }
        
        else if(state==='provider'){
            state = 'tips';
            speakOutput = 'Please contact surgical care team for in depth questions'.
            speakOutput += 'I will contact your provider. Would you like to know how to prevent '+event+' ?';
        }
        
        else if(state==='tips'){
            
            userid = useridMap.get(device_id);
            currentEvent = "Tips requested for " + event;
            await pushRemoteData(currentEvent, userid)
              .then((response) => {
              })
              .catch((err) => {
                //set an optional error message here
                //outputSpeech = err.message;
              });
              
                speakOutput = 'Here are the tips to prevent '+event + ' .';
                        console.log(speakOutput)


        if (event ==='dehydration') {
            speakOutput += 'Eat fruits and vegetables with high water content. ';
            speakOutput +=' Also Try to drink slowly throughout the day avoiding guzzling fluid at one setting.';
        }
        
        if (event ==='fatigue') {
            speakOutput += 'Get to bed at the same time each night. Get ready for bedtime by taking a warm shower to relax just before you get into bed. Turn off all electronic devices 45 minutes before you go to sleep.  ';
        }
        
        if (event ==='fall') {
                              console.log('Inside fall');
                    console.log(speakOutput)

            speakOutput += 'Try walking slowly if you feel faint.';
                    console.log(speakOutput)

        }
        
        if (event ==='abnormal heart rate') {
                  console.log('Inside heart rate');

            speakOutput += 'Check your fitbit. If your heart rate is unexpectedly high try breathing slowly and deeply to relax. If your heart rate is too low please call your doctor right away. ';
        }
        console.log(speakOutput)

        speakOutput += 'Are you feeling badly in any other way? If so, please specify your symptom.';
        
        
        //TODO: Need to have it not continue to fatigue
        state = 'initial';
        event = 'general';
        console.log('We are at the end of tips');
        console.log(speakOutput)
        //speakOutput = 'Testing shorter output here.'
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }
        
        //speakOutput+=state;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NoIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        
        if(state==='initial'){
            if(event==='general'){
                speakOutput = 'Please tell me how you are feeling or say Alexa Stop to end this session.';

                //state = 'caregiver';
                //event = 'fatigue';
                //speakOutput = 'Would you like me to contact your caregiver?';
            }
            else if(event==='fall'){
                state = 'initial';
                event = 'general'
                speakOutput = 'Okay, good to hear that.';
            } else if(event==='abnormal heart rate'){
                state = 'caregiver';
                speakOutput = 'Would you like me to contact your caregiver?';
            } else if(event ==='dehydration') {
                state = 'caregiver';
                speakOutput = 'Would you like me to contact your caregiver?';
            }
            
            else {
                speakOutput = 'Okay. Goodbye. Say Alexa Stop to close app'
            }
        }
        
        else if(state==='urine_blood'){
            event = 'dehydration';
            state = 'caregiver';
            speakOutput = 'Would you like me to contact your caregiver?';
        }
        
        else if(state==='caregiver'){
            state = 'tips';
            speakOutput = 'Would you like to know how to prevent '+event+' ?';
        }
        
        else if(state==='provider'){
            state = 'tips';
            speakOutput = 'Would you like to know how to prevent '+event+' ?';
        }
        
        
        
        else if(state==='tips'){
            speakOutput = 'Okay. Are you feeling badly in any other way? If so, please say the symptom or say Alexa stop to end the conversation.';
            state = 'initial';
            event = 'general';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
        
        
        
        //speakOutput+=state;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const StepsCountldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StepCountIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Today, your step count is ';
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        await getRemoteData('steps', userid, 0, 0)
          .then((response) => {
            const data = response.data;
            speakOutput += `${data.steps}`;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const ShristiSleepIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ShristiSleepIntent';
    },
    async handle(handlerInput) {
        console.log("Inside sleep intent");
        let speakOutput = 'Yesterday you slept for ';
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        await getRemoteData('sleep', userid, 0, 0)
          .then((response) => {
            const data = response.data;
            speakOutput += `${data.sleep}` + ` minutes`;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const HeartRateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HeartRateIntent';
    },
    async handle(handlerInput) {
        const s = Alexa.getSlotValue(handlerInput.requestEnvelope, 'start_time');
        const e = Alexa.getSlotValue(handlerInput.requestEnvelope, 'end_time');
        
        
       // var deviceId = this.event.context.System.device.deviceId
       var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
       console.log(device_id);
       userid = useridMap.get(device_id);
       console.log(userid)

        //const start = s ? s: -1
        //const end = e ? e: -1
        var start = -1;
        var end = -1;
        let speakOutput='';
        var now = false
        if( s && e){
            start = s;
            end = e;
            speakOutput = 'Your average heart rate was ';
        }
        else if(s){
            end = s;
            speakOutput = 'Your heart rate was ';
        }
        else if(e){
            end = e;
            speakOutput = 'Your heart rate was ';
        }
        else{
            now = true;
            speakOutput = 'Right now, your most recently recorded heart rate is ';
        }
        
        var heart_rate;
        await getRemoteData('heart', userid, start, end)
          .then((response) => {
            console.log("Heart rate data request")
              // {"heart_rate":{"time":"23:21:00","value":63}}
            const data = response.data;
            console.log("data in HR" + data.heart_rate)
            if (data.heart_rate.value === undefined) {
                heart_rate = data.heart_rate;
                speakOutput += JSON.stringify(data.heart_rate);
            } else {
                heart_rate = data.heart_rate.value;
                 speakOutput += JSON.stringify(data.heart_rate.value);
            }
            //speakOutput += data.heart_rate;

            //speakOutput += '${data.heart_rate}';
          })
          .catch((err) => {
              console.log("here3")
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
          if (now) {
              speakOutput += '. Your overall average today was '
              start = -3
              end = -3
              
              await getRemoteData('heart', userid, start, end)
          .then((response) => {
            const data = response.data;
            console.log(data)
            if (data.heart_rate.value === undefined) {
                heart_rate = data.heart_rate;
                speakOutput += JSON.stringify(data.heart_rate);
            } else {
                heart_rate = data.heart_rate.value;

                 speakOutput += JSON.stringify(data.heart_rate.value);
            }
          
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
              
              
          }
          
          
          
          //TODO: Ensure heart rate gives a time and date, not just time
          
          // Check if heart_rate is 0. If so, get average instead
          if (heart_rate === '0' || heart_rate === undefined) {
              speakOutput = 'I could not find a heart rate for that time. Please refresh the fitbit app.'
              /*Instead, your most recent heart rate today was '
              start = -1;
              end = -1;
               await getRemoteData('https://peoject-aura.herokuapp.com/auraAdmin/getdata?type=heart&id=' + userid + '&pass=' + password + 'r&start='+start+'&end='+end)
              .then((response) => {
                const data = JSON.parse(response);
                console.log(data)
                console.log(response)
                //TODO: Make the time include a full javascript date object so its easier to speak using date.tolocaltimestring() method
                
                var hour = parseInt(data.heart_rate.time.substr(0, 2));
                
                var meridiem = "a.m.";
                
                if (hour >= 12) {
                    meridiem = "p.m.";
                }
                hour = (hour % 12) || 12;
                var timeString = hour + meridiem;
                
                speakOutput += data.heart_rate.value + ' at ' + timeString;
                heart_rate = data.heart_rate.value;
              })
              .catch((err) => {
                //set an optional error message here
                //outputSpeech = err.message;
              });
              */
          } else {
          
        if( s && e){
            speakOutput += ", from "+ start +" to "+ end;
        }
        else if(s){
            speakOutput += ' at '+s;
        }
        else if(e){
            speakOutput += ' at '+e;
        }
          }
        console.log(heart_rate);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const GoodIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GoodIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'Okay, I am glad you are feeling good. If you feel tired, dehydrated, or hurt, just say "Alexa, open Aura Medical and I am feeling tired" ';
         var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        userid = useridMap.get(device_id);
        var currentEvent = "No issues reported during daily checkup";
        await pushRemoteData(currentEvent, userid)
          .then((response) => {
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};


const CaloriesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaloriesIntent';
    },
    async handle(handlerInput) {
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        userid = useridMap.get(device_id);
        let speakOutput = 'Today, you have burned ';
        await getRemoteData('calories', userid, 0, 0)
          .then((response) => {
            const data = response.data;
            speakOutput += `${data.calories}`;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
        
        speakOutput += ' calories.'

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const FoodIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FoodIntent';
    },
    async handle(handlerInput) {
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        userid = useridMap.get(device_id);
        let speakOutput = 'Today, you have ';
        await getRemoteData('food', userid, 0, 0)
          .then((response) => {
            const data = response.data;
            speakOutput += `${data.num_of_meals}`;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
        speakOutput += ' meals.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const WaterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaterIntent';
    },
    async handle(handlerInput) {
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        userid = useridMap.get(device_id);
        let speakOutput = 'Today, you drank ';
        await getRemoteData('water', userid, 0, 0)
          .then((response) => {
            const data = response.data;
            speakOutput += `${data.water_intake_oz}`;
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });
          
         speakOutput += 'ounces of water.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const ActivityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ActivityIntent';
    },
    async handle(handlerInput) {
        var device_id = handlerInput.requestEnvelope.context.System.device.deviceId;
        console.log(device_id);
        let speakOutput = 'Your heart rate is ';
        userid = useridMap.get(device_id);
        await getRemoteData('active', userid, 0, 0)
          .then((response) => {
            const json_result = response.data;
            speakOutput = 'You were '+json_result['minutesSedentary']+' minutes sedentary, '+json_result['minutesLightlyActive']
                           +' minutes lightly active, '+ json_result['minutesFairlyActive']
                            +' minutes fairly active, and  '+json_result['minutesVeryActive']+' minutes very active.';
          })
          .catch((err) => {
            //set an optional error message here
            //outputSpeech = err.message;
          });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again. If you are completing a check up, please use words like "tired, thirsty, hurt, or fine"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CheckUpIntentHandler,
        LowStepIntentHandler,
        WoundIntentHandler,
        DehydrationIntentHandler,
        FatigueIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        StepsCountldIntentHandler,
        ShristiSleepIntentHandler,
        HeartRateIntentHandler,
        AbnormalHeartRateIntentHandler,
        CaloriesIntentHandler,
        FoodIntentHandler,
        WaterIntentHandler,
        ActivityIntentHandler,
        GoodIntentHandler,
        FallIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();