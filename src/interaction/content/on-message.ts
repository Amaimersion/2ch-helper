import {Message, OnMssg} from "@modules/communication";
import {Download} from "./download";
import {Screenshot} from "./screenshot";
import {Settings} from "./settings";


/**
 * Handles message requests.
 */
abstract class OnMessage extends OnMssg.OnMessage {
    /**
     * Handles messages.
     */
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

    /**
     * Handles messages of `command` type.
     */
    protected static commandHandler: OnMssg.MessageEvent<Message.Content> = async (message, sender, sendResponse) => {
        switch (message.command) {
            case "screenshotPosts": {
                await OnMessage.runAsyncMethod(
                    () => {return Screenshot.posts()},
                    sendResponse
                );
                break;
            }

            case "screenshotThread": {
                await OnMessage.runAsyncMethod(
                    () => {return Screenshot.thread()},
                    sendResponse
                );
                break;
            }

            case "downloadImages": {
                await OnMessage.runAsyncMethod(
                    () => {return Download.images()},
                    sendResponse
                );
                break;
            }

            case "downloadVideo": {
                await OnMessage.runAsyncMethod(
                    () => {return Download.video()},
                    sendResponse
                );
                break;
            }

            case "downloadMedia": {
                await OnMessage.runAsyncMethod(
                    () => {return Download.media()},
                    sendResponse
                );
                break;
            }

            case "downloadThread": {
                await OnMessage.runAsyncMethod(
                    () => {return Download.thread()},
                    sendResponse
                );
                break;
            }

            case "updateSettings": {
                await OnMessage.runAsyncMethod(
                    async () => {
                        await Settings.main();
                        Screenshot.updateSettings();
                        Download.updateSettings();
                    },
                    sendResponse
                );
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
