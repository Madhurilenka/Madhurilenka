const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const mongoose = require('mongoose');
const app=express();
// const multer =require('multer');        //frontend deployement
// const { application } = require('express');    //frontend deployement


app.use(bodyParser.json());
// app.use(multer().any())      //frontend deployement
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://RaviKumarSharma:i6tpVmiNCvIQSjH6@cluster0.pnzdn4a.mongodb.net/group-3-Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);



app.listen(process.env.PORT || 3001, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3001))
});