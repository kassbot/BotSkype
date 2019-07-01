// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as http from 'node/http';

const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            if (context.activity.text === 'ticket') {
                const options = new URL('http://localhost/kassandra/web/api/nbticket');

                const req = http.request(options, (res) => {
                });
                await context.sendActivity(req);
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
                    await context.sendActivity('Hello and welcome! Newcommer');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
