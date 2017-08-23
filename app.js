const Hapi = require('hapi');
const Joi = require('joi');
const Boom = require('boom');


const generator     = require('generate-password');
var passwordHash    = require('password-hash');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hapidb')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

var data =({
    firstname: String,
    lastname: String,
    email: String,
    password: String
});


// Create Task Model
const Task = mongoose.model('Task',data);


// Init Server
const server = new Hapi.Server();

// Add Connection
server.connection({
    port: 3000,
    host:'localhost'
});


// GET Tasks Route
server.route({
    method:'GET',
    path:'/',
    handler: (request, reply) => {
        reply.view('user');
     }
     });  


// POST Tasks Route
server.route({
    method:'POST',
    path:'/user',
    handler: (request, reply) => {
        let firstname = request.payload.firstname;
        let lastname = request.payload.lastname;    
        let email = request.payload.email;     
        let password  = generator.generate();

        

        let newTask= new Task({
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:passwordHash.generate(password)

        });
        
        newTask.save((err, task) => {
            if(err) return console.log(err);
            return reply.redirect().location('index');
        });
    }
});


// GET Tasks Route
server.route({
    method:'GET',
    path:'/index',
    handler: (request, reply) => {
        let tasks = Task.find((err, tasks) => {
            reply.view('index', {
                tasks:tasks

            });
        });
        
    }
});


// // Delete Route
// server.route({  
//     method: 'DELETE',
//     path: '/user/{id}',
//     handler: function (request, reply) {

//         db.tasks.remove({
//             _id: request.params.id
//         }, function (err, result) {

//             if (err) {
//                 return reply(Boom.wrap(err, 'Internal MongoDB error'));
//             }

//             if (result.n === 0) {
//                 return reply(Boom.notFound());
//             }

//             reply().code(204);
//         });
//     }
// });



// Vision Templates
server.register(require('vision'), (err) => {
    if(err){
        throw err;
    }

    server.views({
        engines: {
            html:require('handlebars')
        },
        path: __dirname + '/views'
    });
});


// Start Server
server.start((err) => {
    if(err){
        throw err;
    }

    console.log(`Server started at: ${server.info.uri}`);
});