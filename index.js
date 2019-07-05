// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const restify = require('restify');
const path = require('path');

// Import required bots services. See https://aka.ms/bot-services to learn more about the different part of a bots.
const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');

const { SkypeBot } = require('./bots/SkypeBot');
const { RootDialog } = require('./dialogs/rootDialog');
const { ApiRequest } = require('./request/apiRequest');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create HTTP server.
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Define the state store for your bots. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bots requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the api request class.
const apiRequest = new ApiRequest();

// Create the main dialog.
const dialog = new RootDialog(userState, apiRequest);

// Create the bots's main handler.
const bot = new SkypeBot(conversationState, userState, dialog, apiRequest);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        // Route the message to the bots's main handler.
        await bot.run(turnContext);
    });
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.clear(context);
};
