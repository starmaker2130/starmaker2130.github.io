"use strict";
// author(s):  Patrice-Morgan Ongoly
// version: 0.2.2
// last modified: Saturday, November 24, 2018 19:01 EST
// description: 

// required modules
var bodyParser = require('body-parser');
var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var WhichBrowser = require('which-browser');
// main application instance

var app = express();
/*
var keypress = require('keypress');
var maiden = false;
var bebop = require('node-bebop');
var bebop = require('node-bebop');
var drone = bebop.createClient();*/

// main application settings

var config = {
    PORT: 8009, //process.env.PORT ||
    DIRECTORY: [
        './',  //0
        './css',  //1
        './js', //2
        './media/texture', //3
        './media/pattern', //4
        './media/img', //5 
        './media/model' //6
    ]
};

var scenes = [];
var guests = [];

var dir = config.DIRECTORY;

app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static('/'));

var deviceType = 'unknown';

function checkInitialDeviceConnectionType(headers, ip){
    var result = new WhichBrowser(headers);
    console.log(result.toString());

    if(result.isType('desktop')){
        console.log('This is a desktop computer.');
        deviceType = 'desktop';
    }
    else{
        console.log('This is a mobile device.');
        deviceType = 'mobile';
    }
}

/////////// EXPRESS APP FUNCTIONS ////////
app.get('/', function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var headers = req.headers;
    checkInitialDeviceConnectionType(headers, ip);
    
    res.render('index.html',{root: dir[0]});
});

app.get('/viewer', function(req, res){
    res.render('viewer.html',{root: dir[0]});
});

app.get('/css/:stylesheet_id', function(req, res){
    var stylesheet_id = req.params.stylesheet_id;
    res.sendFile(stylesheet_id, {root: dir[1]});
});

app.get('/js/:script_id', function(req, res){
    var script_id = req.params.script_id;
    res.sendFile(script_id, {root: dir[2]});
});

app.get('/media/texture/:texture_id', function(req, res){
    var texture_id = req.params.texture_id;
    res.sendFile(texture_id, {root: dir[3]});
});

app.get('/media/img/:img_id', function(req, res){
    var img_id = req.params.img_id;
    res.sendFile(img_id, {root: dir[5]});
});

app.get('/media/model/:model_id', function(req, res){
    var model_id = req.params.model_id;
    res.sendFile(model_id, {root: dir[6]});
});

var io = require('socket.io').listen(app.listen(config.PORT, function(){
    console.log(`[0] listening on port ${config.PORT}`);
}));

io.sockets.on('connection', function(socket){
    console.log('client connected.');
    var conn = socket;
    var ip = socket.handshake.address;
    console.log('new connection from ' + ip.address + ':' + ip.port);
    
    socket.on('disconnect', function(){
        console.log(`socket ${socket.id} disconnected.`);
    });
});