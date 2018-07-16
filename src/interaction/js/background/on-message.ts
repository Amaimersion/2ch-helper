import {Message, OnMssg} from "@modules/communication";
import {Download} from "./download";
import {Screenshot} from "./screenshot";
import {Settings} from "./settings";
import {Statistics} from "./statistics";
import {Inject} from "./inject";
import {Notifications} from "./notifications";


/**
 * Handles message requests.
 */
abstract class OnMessage extends OnMssg.OnMessage {
    /**
     * Handles messages.
     */
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

    /**
     * Handles messages of `command` type.
     */
    protected static commandHandler: OnMssg.MessageEvent<Message.Background> = async (message, sender, sendResponse) => {
        switch (message.command) {
            case "screenshotCaptureCoordinates": {
                await OnMessage.runAsyncMethod(
                    () => {return Screenshot.captureCoordinates(message.data.coordinates, message.data.settingKey)},
                    sendResponse
                );
                break;
            }

            case "screenshotCreateFullImage": {
                await OnMessage.runAsyncMethod(
                    () => {return Screenshot.createFullImage(message.data)},
                    sendResponse
                );
                break;
            }

            case "downloadLinks": {
                await OnMessage.runAsyncMethod(
                    () => {return Download.links(message.data.links, message.data.type)},
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

            case "updateStatistics": {
                await OnMessage.runAsyncMethod(
                    () => {
                        return Statistics.updateTotalSpent(
                            message.data.focusOnTime,
                            message.data.focusOffTime
                        );
                    },
                    sendResponse
                );
                break;
            }

            case "injectJS": {
                await OnMessage.runAsyncMethod(
                    () => {return Inject.script(message.data.injectDetails)},
                    sendResponse
                );
                break;
            }

            case "createReplyNotification": {
                await OnMessage.runAsyncMethod(
                    () => {return Notifications.createReplyNotification(message.data.options, sender)},
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
                throw new Error(errorMessage);
            }
        }
    }
}


OnMssg.attach<Message.Background>(OnMessage.messageHandler);
