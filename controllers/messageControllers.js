const asyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");
const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const { serviceClients, Session, cloudApi } = require("@yandex-cloud/nodejs-sdk");
const fetch = require('node-fetch');

const sendMessage = asyncHandler(async (req, res) => {
    const {content, chatId} = req.body;
    if (!content || !chatId) {
        console.log("Invalid data passed");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
});

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({chat: req.params.chatId}).populate("sender", "name pic email").populate("chat");
        res.json(messages);
    } catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
});

const translate = asyncHandler(async (req, res) => {
    const {message} = req.body;
    if (!message) {
        res.sendStatus(400);
    }
    try {
        const iam_token = process.env.IAM_TOKEN;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${iam_token}`,
        };

        const body = {
            texts: [message],
            folderId: process.env.FOLDER_ID,
            targetLanguageCode: "en",
        };

        const response = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
            method: "POST",
            body: JSON.stringify(body),
            headers: headers,
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(401);
        console.log(err.message);
        throw new Error(err.message);
    }
})

module.exports = {sendMessage, allMessages, translate};