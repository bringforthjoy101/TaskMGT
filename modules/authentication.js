const fetch = require("node-fetch");
var config = require('../config/config.export');
var CryptoJS = require("crypto-js");
var bCrypt = require('bcrypt-nodejs');


// var models = require('../modules/dbLayer');
var models = require('../models');
var User = models.user;
const { Op } = require("sequelize");
var passport = require('passport');
const auth = require('./auth');

function generateHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};


function upsert(values, condition) {
    return User
        .findOne({ where: condition })
        .then(function(obj) {
            // update
            if(obj)
                return obj.update(values);
            // insert
            return User.create(values);
        })
}

module.exports = function (req, res) {
  


  return async function (req, res, next) {

    let map={};
    
        /*
            * lets check authentication method
            * if it is config then pick values from config
            * if it is post then get values from post
        */
    

        if(config.authentication_method=="POST"){
            //we will get values from POST
    
            let data = req.body;
            data = JSON.parse(JSON.stringify(data));
            console.log('This is the req.body: ' + data);
            console.log('This is the app_key_hash: ' + data.app_key_hash);
            console.log('This is the module_id: ' + data.module_id);
            //let validate this data
            if(!data.hasOwnProperty('app_key_hash')){
                res.redirect('/error?error=Invalid access keys');
            }
    
            if(!data.hasOwnProperty('module_id')){
                res.redirect('/error?error=Invalid module');
            }
    
        map['module_id'] = data.module_id
        map['app_key'] = data.app_key_hash
        }
        else if(config.authentication_method=="CONFIG"){
            //we will get values from config
    
        let data = {};
        data.public_key = config.public_key
        data.private_key = config.private_key
    
        let data_json = JSON.stringify(data);
        
            //create hash key from the API keys (in POST method this hash is posted from dashboard )
        var ciphertext = CryptoJS.AES.encrypt(data_json,config.SALT);
            let app_key_hash = ciphertext.toString()
        
            map['app_key'] = app_key_hash
            //get module name from config, (in POST method this is also posted from the dashboard)
            map['module_name'] = config.module_name
    
        }
        
        // DONE WITH POST OR CONFIG ACCESS
        
        // USE APP HASH KEY GENERATED FROM POST REQUEST 
        
        map['api'] = 'module_access'

        let jsonmap = JSON.stringify(map);
        console.log('This is jsonmap: ' + jsonmap);
        
        let response = await fetch(config.API_URL,{
            method:'POST',
            async:false,
            body:jsonmap,
            headers: {'content-type': 'application/json' }
        });
        
        console.log('This is response from api call with hashkey/modulename/apiUrl: ' + response);

        req.ret_data = await response.json();
        
        console.log('This is response req ' + req);

        console.log('This is response req.ret_data ' + req.ret_data);
        
        console.log('This is response req.ret_data.data ' + req.ret_data.data);

        console.log('This is ret_data');
        
        // var ret_data = req.ret_data;
        
        // for (var property in ret_data) {
        //   if (ret_data.hasOwnProperty(property)) {
        //     console.log(property);
        //   }
        // }
        
        // const entries_ret_data = Object.entries(ret_data)
        // console.log(entries_ret_data)
        
        // console.log('This is ret_data_data');
        // var ret_data_data = req.ret_data.data;
        // for (var property in ret_data_data) {
        //   if (ret_data_data.hasOwnProperty(property)) {
        //     console.log(property);
        //   }
        // }
        // const entries_ret_data_data = Object.entries(ret_data_data)
        // console.log(entries_ret_data_data)
        
        req.session.ret_data = req.ret_data;
        
        console.log('This is req.session.ret_data '+ req.session.ret_data);
        
        if(req.ret_data.status){
            if(req.ret_data.data.permission=="" || req.ret_data.data.permission=="no" || req.ret_data.data.permission==false){
                res.redirect('error?error=You have no permissions on this module');
                next();
            } else{
                console.log('EVERYTHING IS GOOD 1');
                console.log('CREATE OR UPDATE USER RECORDS IN DB');
                
                var response_data = req.ret_data.data
                
                const username = response_data.user_detail.user_name;
            
                var password = response_data.user_detail.user_name + response_data.user_detail.account_id + response_data.current_business;
                
                var userPassword = generateHash(password);
                
                const name = response_data.user_detail.name;
                const module_name = response_data.module_name;
                const email = response_data.user_detail.email;
                const module_id = response_data.module_id;
                const account_id = response_data.user_detail.account_id;
                const permission = response_data.permission;
                const profile = response_data.role;
                const current_business = response_data.current_business;
                
                var department_name = 'Not Applicable';
                if (typeof response_data.department_name !== 'undefined')
                {
                    department_name = response_data.department_name;
                }  
                console.log('department_name: ' + response_data.department_name);
                console.log('module_id: ' + response_data.module_id);
                console.log('url: ' + response_data.url);
                console.log('permission ' + response_data.permission);
                console.log('account_id: ' + response_data.user_detail.account_id);
                console.log('user_name: ' + response_data.user_detail.user_name);
                console.log('name: ' + response_data.user_detail.name);
                console.log('email ' + response_data.user_detail.email);
                console.log('module_name: ' + response_data.module_name);
                console.log('current_business: ' + response_data.current_business);
                console.log('role ' + response_data.role);
                
                 // create a new user with the password hash from bcrypt
                let user = await upsert({ 
                     username: username,
                     password: userPassword,
                     name: name,
                     module_name: module_name,
                     email: email,
                     module_id: module_id,
                     account_id: account_id,
                     permission: permission,
                     profile: profile,
                     department_name: department_name,
                     current_business: current_business
                    //  ,updated_at: Date.now(),
                }, { email: email });
                
                console.log(user);
                console.log('I am done creating or updating user');

                
                // CAN YOU CREATE A LOGIC THAT WILL AUTOMATICALL LOGS THE USER IN HERE?
                // AFTER THAT REDIRECT THE USER TO /user page to confirm they are now logged in

                auth.checkCredentials( user.email, password, ( err, user ) => {
                    if( err ) {
                        res.redirect('https://manifestusermodule.herokuapp.com/login');
                        return next();
                    }
                    req.login( user, function(err) {
                        next();
                    } );

                } )
             
                //     var request = require('request');
                //     request.post(
                //     {
                //     url:'https://manifestmodule1.herokuapp.com/login',
                //     json: {
                //       email:user.email,
                //       password:password
                //         },
                //     headers: {
                //         'Content-Type': 'application/json'
                //         }
                //     },
                    
                //   passport.authenticate('local', {
                //         failureRedirect: 'https://manifestusermodule.herokuapp.com/login'
                //     })
                //     )
                
            }
            
        }
        else{
    
            var message = 'Invalid request';
            if(req.ret_data.hasOwnProperty('message') && (typeof req.ret_data.message === 'string' || req.ret_data.message instanceof String)){
                //we have message in response and that message is string
                message = req.ret_data.message
            }
    
            message = encodeURIComponent(message);
            
            res.redirect('error?error='+ message);
            next();
        }
        

            
  }
}

