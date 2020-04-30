var config = require('./config.global');

config.env = 'production';
config.hostname = 'manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com';
config.db = {
    database: 'emmatodoapp',
    username: 'emmanueluser',
    password: '000000',
    host: "manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com",
    sequelizeParams: {
        dialect: 'postgres',
        host: "manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com",
        operatorsAliases: false
    }
}
config.sessionDb = {
    database: 'emmatodoapp',
    username: 'emmanueluser',
    password: '000000',
    host: "manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com",
    sequelizeParams: {
        dialect: 'postgres',
        host: "manifestdbinstance.cgq0reqixqsd.us-east-1.rds.amazonaws.com",
        operatorsAliases: false
    }
}

module.exports = config;

