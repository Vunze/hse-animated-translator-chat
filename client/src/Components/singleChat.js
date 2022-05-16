import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/chatProvider";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {getSender, getSenderFull} from "../config/ChatLogic";
import ProfileModal from "./miscellaneous/profileModal";
import UpdateGroupChatModal from "./miscellaneous/updateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./scrollableChat";
import io from "socket.io-client";
// import { response } from "express";
import Player from "./miscellaneous/player";

const ENDPOINT = "https://hse-chat.herokuapp.com/";
// const ENDPOINT = "https://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [playMessage, setPlayMessage] = useState(false);

    const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();
    const toast = useToast();

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true);

            const {data} = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (err) {
            toast({
                title: "Error occured",
                description: "Failed to get the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        })
    });

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            // fetch("https://181a-34-136-81-154.ngrok.io/synthesize/text").then((response) => {
            //     response.json();
            // }).then((data) => console.log(data));
            try {
                const config = {
                    headers: {
                        "Content-type" : "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const {data} = await axios.post("/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, config);
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (err) {
                toast({
                    title: "Error occured",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    const typingHandler = (event) => {
        setNewMessage(event.target.value);
        setPlayMessage(true);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

    const handleTranslate = async (event) => {
        if (event.key === "Enter" && newMessage) {
            try {
                const IAM_TOKEN = "t1.9euelZrImMbHmMiLy5HJzZjIm5CKmu3rnpWaipzKxozGk5vHzpKVlsfMmZXl8_cILHZr-e89UQtc_d3z90hac2v57z1RC1z9.Zmuyek1WfbR4jpoDEcT8FxwNSZ7CFReJcdiZXVL5tZHNOHGBwaEVKLmrD9jf-ppoC3Vd62fVcnOCOP4G8iXDBg";
                const folder_id = "b1gocltv7nqqa6dujfr4";
                const target_language = "en";
                const text = [newMessage];

                const data = new FormData();
                data.append("targetLanguageCode", target_language);
                data.append("texts", text);
                data.append("folderId", folder_id);
                const headers = {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${IAM_TOKEN}`,
                };

                const response = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
                    body: data,
                    headers: headers,
                });

                // const response = await fetch("https://api.npms.io/v2/search?q=react");
                // fetch("www.thecocktaildb.com/api/json/v1/1/random.php").then(response => response.json()).then(data => console.log(data));
                if (!response.ok) {
                    toast({
                        title: "Testing",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    })
                } else {
                    const data = await response.json();
                    console.log(data);
                }
            } catch (err) {
                toast({
                    title: "Error occured",
                    description: "error",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    return <>
        {selectedChat ? (
            <>
            <Text
                fontSize={{base: "28px", md: "30px"}}
                pb={3}
                px={2}
                w="100%"
                fontFamily="Work sans"
                display="flex"
                justifyContent={{base: "space-between"}}
                alignItems="center"
            >
                <IconButton
                    display={{base: "flex", md: "none"}}
                    icon={<ArrowBackIcon/>}
                    onClick={()=>setSelectedChat("")}
                >
                </IconButton>
                {!selectedChat.isGroupChat ? (
                    <>
                    {getSender(user, selectedChat.users)}
                    <ProfileModal user={getSenderFull(user, selectedChat.users)}/>
                    </>
                ) : (
                    <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                        fetchMessages={fetchMessages}
                    />
                    </>
                )}
            </Text>
            <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
            >
                {loading ? (
                    <Spinner
                        size="xl"
                        w={20}
                        h={20}
                        alignSelf="center"
                        margin="auto"
                    />
                ) : (
                    <div className="messages">
                        <ScrollableChat messages={messages}/>
                    </div>
                )}
                <FormControl onKeyDown={(event) => {sendMessage(event); handleTranslate(event)}} isRequired mt={3}>
                    {isTyping
                    ? <div>Typing...</div>
                    : <></>}
                    {playMessage
                    ? <Player url="http://streaming.tdiradio.com:8000/house.mp3"/>
                    : <></>}
                    {/* <Player url="http://streaming.tdiradio.com:8000/house.mp3"/> */}
                    <Input 
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Enter a message..." 
                        onChange={typingHandler}
                        value={newMessage}
                    />
                </FormControl>
            </Box>
            </>
        ) : (
            <Box
                d="flex"
                alignItems="center"
                justifyContent="center"
                h="100%"
            >
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on a user to start chatting
                </Text>

            </Box>
        )}
    </>
};

export default SingleChat;