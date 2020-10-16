const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// membuat redis client
let client = redis.createClient();

client.on('connect', function () {  
    console.log('connected to redis...');
});

// melihat port
const port = 3000;

// inisialisasi aplikasi
const app = express();

// view engine
app.engine('handlebars',exphbs({defaultLayout:'main'}));  
app.set('view engine','handlebars');


// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// methodOverride
app.use(methodOverride('_method'));

// buka halaman pencarian
app.get('/',function (req,res,next) {  
    res.render('searchusers');
});

// proses pencarian data
app.post('/user/search',function (req,res,next) {  
    let id = req.body.id;

    client.hgetall(id, function (err,obj) {  
        if (!obj) {
            res.render('searchusers',{
                error: 'user tidak ditemukan'
            });
        } else {
            obj.id = id;
            res.render('details',{
                user:obj
            }); 
        }
    });
});

// buka halaman tambah data user
app.get('/user/add',function (req,res,next) {  
    res.render('adduser');
});

// proses tambah data user
app.post('/user/add',function (req,res,next) {  
    let {id} = req.body
    let {first_name} = req.body
    let {last_name} = req.body
    let {email} = req.body
    let {phone} = req.body

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], function(err, reply){
        if(err) {
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    });
});

// buka halaman edit data
app.get('/user/edit/:id', function(req,res,next){
    let {id} = req.params

    client.hgetall(id, function(err, obj){
        obj.id = id
        res.render('updateuser', {
            user: obj
        })
    })
})

// proses edit data
app.put('/user/update', function(req, res, next){
    let {id} = req.body
    let {first_name} = req.body
    let {last_name} = req.body
    let {email} = req.body
    let {phone} = req.body

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], function(err, reply){
        if(err) {
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    })
})

// proses hapus data
app.delete('/user/delete/:id', function(req,res,next) {
    client.del(req.params.id)
    res.redirect('/')
})

// open port 
app.listen(port,function () {  
    console.log('server started on port '+port); 
});