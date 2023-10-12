module.exports=function(button_num){
    var https = require("https");

    var body = JSON.stringify({

      "virtualButton": button_num,

      "accessCode": "amzn1.ask.account.AHEKB32EA4XPJKDYLE3FTSXMXNXCYKJV42MCAXRUFLVNKF5ZGWJEAEC43Z4T2HQNC64UV26BBUP3VZ75C67OZ7E7BKQDMRNJUIZK3ZTQA4HUQFNRVCSQ5TLCIMKIGGOQLH2EU3DDOIVEQCWQOCCK5WYJHVUEAF6GEATAE3ZWVYQPLBGG6Q5EYL2FSURDFBZTL33MHDON3CWGN7I"
    });

    https.request({

      hostname: "api.virtualbuttons.com",

      path: "/v1",

      method: "POST",

      headers: {

          "Content-Type": "application/json",

          "Content-Length": Buffer.byteLength(body)

      }

    }).end(body);

    console.log('Pinged virtual button num: ' + button_num)

    }
    
