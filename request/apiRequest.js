
class ApiRequest {
    constructor() {
        const api = 'ok';
    }
    async getDataTicket() {
        return new Promise((resolve, reject) => {
            let rp = require('request-promise');
            let options = {
                // uri: 'http://localhost/kassandra/web/api/nbticket',
                uri: 'http://kassandra.fun/api/nbticket',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-auth-token': '8d71f29234e379cbd93fab44743203c5bot'
                },
                json: true, // Automatically parses the JSON string in the response
                resolveWithFullResponse: true
            };

            return rp(options).then((response) => {
                resolve(response.body);
            });
        });
    }
    async postNewTicket(paramTicket, nameCreator) {
        return new Promise((resolve, reject) => {
            let rp = require('request-promise');
            let options = {
                method: 'POST',
                uri: 'http://kassandra.fun/api/newticket',
                // uri: 'http://localhost/kassandra/web/api/newticket',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-auth-token': '8d71f29234e379cbd93fab44743203c5bot'
                },
                json: true, // Automatically parses the JSON string in the response
                resolveWithFullResponse: true
            };
            options.body = paramTicket;
            options.body.nameCreator = nameCreator;
            return rp(options).then((response) => {
                resolve(response.body);
            });
        });
    }

    async postCloseTicket(id) {
        return new Promise((resolve, reject) => {
            let rp = require('request-promise');
            let options = {
                method: 'POST',
                uri: 'http://kassandra.fun/api/closeticket',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-auth-token': '8d71f29234e379cbd93fab44743203c5bot'
                },
                body: {
                    id: id
                },
                json: true, // Automatically parses the JSON string in the response
                resolveWithFullResponse: true
            };
            return rp(options).then((response) => {
                resolve(response.body);
            });
        });
    }

    async postTakeTicket(id, name) {
        return new Promise((resolve, reject) => {
            let rp = require('request-promise');
            let options = {
                method: 'POST',
                // uri: 'http://kassandra.fun/api/taketicket',
                uri: 'http://kassandra.fun/api/taketicket',
                // uri: 'http://localhost/kassandra/web/api/taketicket',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-auth-token': '8d71f29234e379cbd93fab44743203c5bot'
                },
                body: {
                    id: id,
                    nameTek: name
                },
                json: true, // Automatically parses the JSON string in the response
                resolveWithFullResponse: true
            };
            return rp(options).then((response) => {
                resolve(response.body);
            });
        });
    }
}

module.exports.ApiRequest = ApiRequest;
