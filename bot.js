// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        function getDataTicket() {
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

        function postNewTicket(paramTicket, nameCreator) {
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

        function postCloseTicket(id) {
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

        function postTakeTicket(id, name) {
            return new Promise((resolve, reject) => {
                let rp = require('request-promise');
                let options = {
                    method: 'POST',
                    uri: 'http://kassandra.fun/api/taketicket',
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

        async function getOpenTickets() {
            let ret = await getDataTicket();
            let dateFormat = require('dateformat');
            let response = 'Liste des tickets ouvert: \n___________________\n';

            for (let i = 0; ret[i]; i++) {
                if (i !== 0) response += '\n___________________\n';
                response += 'Titre : ' + ret[i].title;
                response += '\n- Priorité : ' + ret[i].priority;
                response += '\n- Createur : ' + ret[i].nameCreator;
                response += '\n- Description : ' + ret[i].description;
                response += '\n- Responsable : ' + ret[i].nameTek;
                response += '\n- Date postée : ' + dateFormat(ret[i].createdAt, 'dd-mm');
                response += '\n- id : ' + ret[i].id;
            }
            return response;
        }

        function checkStr(str) {
            let check = { title: false, desc: false, prio: false };
            let ret = { title: '', desc: '', prio: '' };
            let value = '';
            for (let i = 0; str[i]; i++) {
                switch (str[i]) {
                case '-title': {
                    value = 'title';
                    break;
                }
                case '-desc': {
                    value = 'desc';
                    break;
                }
                case '-prio': {
                    value = 'prio';
                    break;
                }
                default:
                    switch (value) {
                    case 'title': {
                        check.title = true;
                        ret.title += str[i] + ' ';
                        break;
                    }
                    case 'desc': {
                        check.desc = true;
                        ret.desc += str[i] + ' ';
                        break;
                    }
                    case 'prio': {
                        check.prio = true;
                        ret.prio += str[i] + ' ';
                        break;
                    }
                    }
                }
            }
            if (check.title === true && check.desc === true && check.prio === true) {
                return ret;
            } else {
                return false;
            }
        }

        async function manageTicket(name, str) {

        }

        this.onMessage(async (context, next) => {
            let str = context.activity.text.split(' ');
            let response = null;

            if (str[0] === 'ticket') { //
                response = manageTicket(context.activity.from.name, str);
                if (str[1] === 'view') {
                    response = await getOpenTickets();
                } else if (str[1] === 'new') {
                    let paramTicket = checkStr(str);
                    if (checkStr(str) !== false) {
                        response = await postNewTicket(paramTicket, context.activity.from.name);
                    } else {
                        response = 'Usage : Veuillez renseigner tout les champs suivant dans la commande' +
                            '\n- -title [titre du ticket]' +
                            '\n- -desc [description du ticket]' +
                            '\n- -prio [priorité du ticket : 1 (élevé) ,2 ou 3 (bas)]';
                    }
                } else if (str[1] === 'close' && str[2] != null) {
                    response = await postCloseTicket(str[2]);
                } else if (str[1] === 'take' && str[2] != null) {
                    response = await postTakeTicket(str[2], context.activity.from.name);
                } else {
                    response = 'Usage : ' +
                        '\n- view : affiche tout les tickets ouverts' +
                        '\n- new : crée un nouveau ticket' +
                        '\n- close [id] : ferme le ticket [id]' +
                        '\n- take [id] : assigne le responsable du ticket [id] avec votre nom skype';
                }
                await context.sendActivity(response);
            } else if (str[0] === 'help') {
                await context.sendActivity(`Commandes disponibles actuellement : ticket'`);
            } else {
                await context.sendActivity(`Je ne connais pas cette commande'`);
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
