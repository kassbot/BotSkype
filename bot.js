// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            if (context.activity.text === 'ticket') {
                let res;
                let request = require('request');
                // eslint-disable-next-line handle-callback-err
                request('http://127.0.0.1/kassandra/web/api/nbticket', async function(error, response, body) {
                    console.log(body);
                    res = body;
                    await context.sendActivity(res);
                });
                await context.sendActivity(res);
                // let options = {
                //     host: 'http://localhost/web',
                //     path: '/api/nbticket',
                //     method: 'GET'
                // };
                // let req = http.request(options, function(res) {
                //     console.log('STATUS: ' + res.statusCode);
                //     console.log('HEADERS: ' + JSON.stringify(res.headers));
                //     res.setEncoding('utf8');
                //     res.on('data', function(chunk) {
                //         console.log('BODY: ' + chunk);
                //     });
                //     req.on('error', function(e) {
                //         console.log('problem with request: ' + e.message);
                //     });
                // });
            } else {
                await context.sendActivity(`You said ME HAIL '${ context.activity.text }'`);
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
