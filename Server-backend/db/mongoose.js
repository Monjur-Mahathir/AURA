var mongoose = require('mongoose');
var mongoose_connection = 'mongodb+srv://mahathir-unc21:maha1234@clusteraura.xwonb.mongodb.net/USER?retryWrites=true&w=majority'
//mongoose.connect(process.env.MONGOOSE_CONNECTION ,{ useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(mongoose_connection ,{ useNewUrlParser: true, useUnifiedTopology: true});

//Set up default mongoose connection
//var mongoDB = 'mongodb://127.0.0.1/aura_database';
//mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;
