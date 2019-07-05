// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder/lib/index');
const { ApiRequest } = require('../request/apiRequest');

class SkypeBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog, api) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.api = new ApiRequest();
        this.dialog.progressDialog = false;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            let str = context.activity.text.split(' ');
            let response = null;

            if (this.dialog.progressDialog) {
                await this.dialog.run(context, this.dialogState);
            } else if (str[0] === 'ticket') { //
                if (str[1] === 'view') {
                    response = await getOpenTickets(this.api);
                } else if (str[1] === 'new') {
                    let paramTicket = checkStr(str);
                    if (checkStr(str) !== false) {
                        response = await this.api.postNewTicket(paramTicket, context.activity.from.name);
                    } else {
                        this.dialog.progressDialog = true;
                        await context.sendActivity('Lancement de la creation de Ticket');
                        await this.dialog.run(context, this.dialogState);
                    }
                } else if (str[1] === 'close' && str[2] != null) {
                    response = await this.api.postCloseTicket(str[2]);
                } else if (str[1] === 'take' && str[2] != null) {
                    response = await this.api.postTakeTicket(str[2], context.activity.from.name);
                } else {
                    response = 'Usage : ' +
                        '\n- view : affiche tout les tickets ouverts' +
                        '\n- new : crée un nouveau ticket avec les champs obligatoires suivant : ' +
                        '\n --title [titre du ticket] ' +
                        '\n --desc [description du ticket]' +
                        '\n --prio [priorité du ticket : 1 (élevé) ,2 ou 3 (bas)]' +
                        '\n- close [id] : ferme le ticket [id]' +
                        '\n- take [id] : assigne le responsable du ticket [id] avec votre nom skype';
                }
            } else if (str[0] === 'help') {
                response = `Commandes disponibles actuellement : ticket'`;
            } else {
                response = `Je ne connais pas cette commande'`;
            }
            await context.sendActivity(response);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
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



        async function getOpenTickets(api) {
            let ret = await api.getDataTicket();
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
    }
}

module.exports.SkypeBot = SkypeBot;
