import React, {useState} from "react";
import { Tooltip, Button, Text, Menu, MenuButton, Avatar,
MenuList, MenuItem, MenuDivider, Drawer, useDisclosure,
DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner, Badge, Box } from "@chakra-ui/react";
import {BellIcon, ChevronDownIcon, SearchIcon} from "@chakra-ui/icons";
import { ChatState } from "../../Context/chatProvider";
import ProfileModal from "./profileModal";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
// import {Box} from "@chakra-ui/layout"
import { getSender } from "../../config/ChatLogic";

const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const {user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
    const history = useHistory();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Empty input",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (err) {
            toast({
                title: "Error occured!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.post("/api/chat", {userId}, config);
            if (!chats.find((c => c._id === data._id))) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (err) {
            toast({
                title: "Error getting the chat",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    return (
        <div>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px"
            >
                <Tooltip
                    label="Search Users to chat with"
                    hasArrow placement="bottom-end"
                >
                    <Button variant="ghost" onClick={onOpen}>
                        <SearchIcon/>
                        <i className="fas fa-search"></i>
                        <Text display={{base:"none", md:"flex" }} px="4">
                            Search User
                        </Text>
                    </Button>

                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    Vunzechat
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <Badge>
                                {notification.length ? "New" : "No new messages"} 
                            </Badge>
                            <BellIcon fontSize="2xl" m={1}/>
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No new messages"}
                            {notification.map(note => (
                                <MenuItem key={note._id} onClick={() => {
                                    setSelectedChat(note.chat);
                                    setNotification(notification.filter((n) => n !== note));
                                }}>
                                    {note.chat.isGroupChat
                                    ? `New message in ${note.chat.chatName}`
                                    : `New message from ${getSender(user, note.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}>
                            </Avatar>
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider/>
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay/>
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e)=>setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Find</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading/>
                        ) : (
                            searchResult?.map(user => (
                                <UserListItem
                                    key = {user._id}
                                    user={user}
                                    handleFunction={()=>accessChat(user._id)}
                                />
                            ))
                        )}
                    {loadingChat && <Spinner ml="auto" display="flex"/>}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default SideDrawer;