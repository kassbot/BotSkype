// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs/lib/index');
const { SlotDetails } = require('./slotDetails');
const { SlotFillingDialog } = require('./slotFillingDialog');
const { ApiRequest } = require('../request/apiRequest');

class RootDialog extends ComponentDialog {
    /**
     * SampleBot defines the core business logic of this bots.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(userState) {
        super('root');
        this.userStateAccessor = userState.createProperty('result');

        // for more info look at sample 19.custom-dialog

        const ticketSlots = [
            new SlotDetails('title', 'text', 'Entrez le titre du ticket.'),
            new SlotDetails('desc', 'text', 'Entrez la description du ticket'),
            new SlotDetails('prio', 'number', 'Choisir une priorité pour le ticket : 1, 2 ou 3')
        ];

        const slots = [
            new SlotDetails('ticket', 'ticket')
        ];

        this.addDialog(new NumberPrompt('number'));
        this.addDialog(new TextPrompt('text'));
        this.addDialog(new SlotFillingDialog('ticket', ticketSlots));
        this.addDialog(new SlotFillingDialog('slot-dialog', slots));
        this.addDialog(new WaterfallDialog('root', [
            this.startDialog.bind(this),
            this.processResults.bind(this)
        ]));
        this.api = new ApiRequest();
        this.progressDialog = false;
        this.initialDialogId = 'root';
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} dialogContext
     */
    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
        return await results;
    }

    // This is the first step of the WaterfallDialog.
    // It kicks off the dialog with the multi-question SlotFillingDialog,
    // then passes the aggregated results on to the next step.
    async startDialog(step) {
        return await step.beginDialog('slot-dialog');
    }

    // This is the second step of the WaterfallDialog.
    // It receives the results of the SlotFillingDialog and displays them.
    async processResults(step) {
        // Each "slot" in the SlotFillingDialog is represented by a field in step.result.values.
        // The complex that contain subfields have their own .values field containing the sub-values.
        const values = step.result.values;

        const ticket = values['ticket'].values;

        await step.context.sendActivity('Votre ticket va être crée avec les parametres suivants');
        await step.context.sendActivity('Titre : ' + ticket['title']);
        await step.context.sendActivity('Description : ' + ticket['desc']);
        await step.context.sendActivity('Priorité : ' + ticket['prio']);
        await step.context.sendActivity('Createur : ' + step.context.activity.from.name);

        this.progressDialog = false;

        this.api.postNewTicket(ticket, step.context.activity.from.name);

        return await step.endDialog();
    }

    // Validate that the provided shoe size is between 0 and 16, and allow half steps.
    // This is used to instantiate a specialized NumberPrompt.
    async shoeSizeValidator(prompt) {
        if (prompt.recognized.succeeded) {
            const shoesize = prompt.recognized.value;

            // Shoe sizes can range from 0 to 16.
            if (shoesize >= 0 && shoesize <= 16) {
                // We only accept round numbers or half sizes.
                if (Math.floor(shoesize) === shoesize || Math.floor(shoesize * 2) === shoesize * 2) {
                    // Indicate success.
                    return true;
                }
            }
        }

        return false;
    }
}

module.exports.RootDialog = RootDialog;
