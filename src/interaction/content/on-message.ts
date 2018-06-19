import {Message, OnMssg} from "@modules/communication";


abstract class OnMessage extends OnMssg.OnMessage {
    public static messageHandler: OnMssg.MessageEvent<Message.Content> = (message, sender, sendResponse) => {
        if (message.type === "command") {
            OnMessage.commandHandler(message, sender, sendResponse);
        } else {
            throw new Error(OnMessage.getUnknownMessageErrorText(
                message,
                sender,
                "Unknown message type."
            ));
        }
    }

    protected static commandHandler: OnMssg.MessageEvent<Message.Content> = (message, sender, sendResponse) => {
        if (typeof message.command === "string") {
            sendResponse({status: true});
        } else {
            throw new Error(OnMessage.getUnknownMessageErrorText(
                message,
                sender,
                "Unknown message command."
            ));
        }
    }
}


OnMssg.attach<Message.Content>(OnMessage.messageHandler);
