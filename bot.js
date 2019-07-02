// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        // function sleep(ms) {
        //     return new Promise(resolve => {
        //         setTimeout(resolve, ms);
        //     });
        // }
        function getDataTicket() {
            return new Promise((resolve, reject) => {
                let rp = require('request-promise');
                let options = {
                    // uri: 'http://localhost/kassandra/web/api/nbticket',
                    uri: 'http://kassandra.fun/web/api/nbticket',
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    json: true, // Automatically parses the JSON string in the response
                    resolveWithFullResponse: true
                };

                return rp(options).then((response) => {
                    resolve(response.body);
                });
            });
        }

        this.onMessage(async (context, next) => {
            if (context.activity.text === 'ticket') {
                let ret = await getDataTicket();
                let dateFormat = require('dateformat');
                console.log(ret[0]);
                let response = 'Liste des tickets ouvert: \n';


                for (let i = 0; ret[i]; i++) {
                    if (i !== 0) response += '\n\n';
                    response += 'Titre : ' + ret[i].title;
                    response += '\n- Priorité : ' + ret[i].priority;
                    response += '\n- Createur : ' + ret[i].nameCreator;
                    response += '\n- Description : ' + ret[i].description;
                    response += '\n- Date postée : ' + dateFormat(ret[i].createdAt, 'dd-mm');
                    response += '\n- id : ' + ret[i].id;
                }


                await context.sendActivity(response);
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
