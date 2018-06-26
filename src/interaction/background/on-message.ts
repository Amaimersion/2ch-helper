import {Message, OnMssg} from "@modules/communication";
import {Download} from "./download";
import {Screenshot} from "./screenshot";


abstract class OnMessage extends OnMssg.OnMessage {
    public static messageHandler: OnMssg.MessageEvent<Message.Background> = async (message, sender, sendResponse) => {
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

    protected static commandHandler: OnMssg.MessageEvent<Message.Background> = async (message, sender, sendResponse) => {
        switch (message.command) {
            case "downloadLinks": {
                try {
                    await Download.links(message.data.links, message.data.type);
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

            case "screenshotCaptureCoordinates": {
                try {
                    await Screenshot.captureCoordinates(message.data.coordinates, message.data.settingKey);
                } catch (error) {
                    sendResponse({status: false, errorText: error.message});
                    throw error;
                }

                sendResponse({status: true});
                break;
            }

            case "screenshotCreateFullImage": {
                try {
                    await Screenshot.createFullImage(message.data);
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
                throw new Error(errorMessage);
            }
        }
    }
}


OnMssg.attach<Message.Background>(OnMessage.messageHandler);
