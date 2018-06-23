import {Message, OnMssg} from "@modules/communication";
import {Download} from "./download";
import {Screenshot} from "./screenshot";


abstract class OnMessage extends OnMssg.OnMessage {
    public static messageHandler: OnMssg.MessageEvent<Message.Content> = async (message, sender, sendResponse) => {
        switch (message.type) {
            case "command": {
                OnMessage.commandHandler(message, sender, sendResponse);
                break;
            }

            default: {
                const errorMessage = OnMessage.getUnknownMessageErrorText(
                    message,
                    sender,
                    "Unknown message type."
                );

                sendResponse({status: false, errorText: errorMessage});
                throw new Error(errorMessage);
            }
        }
    }

    protected static commandHandler: OnMssg.MessageEvent<Message.Content> = async (message, sender, sendResponse) => {
        switch (message.command) {
            case "downloadImages": {
                try {
                    await Download.images();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "downloadVideo": {
                try {
                    await Download.video();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "downloadMedia": {
                try {
                    await Download.media();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "downloadThread": {
                try {
                    await Download.thread();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "screenshotPosts": {
                try {
                    await Screenshot.posts();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "screenshotThread": {
                try {
                    await Screenshot.thread();
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            default: {
                const errorMessage = OnMessage.getUnknownMessageErrorText(
                    message,
                    sender,
                    "Unknown message command."
                );

                sendResponse({status: false, errorText: errorMessage});
                throw new Error(errorMessage);;
            }
        }
    }
}


OnMssg.attach<Message.Content>(OnMessage.messageHandler);
