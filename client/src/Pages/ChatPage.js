// import { Box } from '@chakra-ui/layout';
import React, { useState } from 'react';
import SideDrawer from '../Components/miscellaneous/sideDrawer';
import { ChatState } from '../Context/chatProvider';
import MyChats from '../Components/MyChats';
import ChatBox from '../Components/ChatBox';
import { Box } from "@chakra-ui/react";

const Chatpage = () => {
    const [fetchAgain, setFetchAgain] = useState(false);
    const {user} = ChatState();

    return (
        <div style={{width: "100%"}}>
            {user && <SideDrawer/>}
            <Box
                display="flex"
                justifyContent="space-between"
                w="100%"
                h="91.5vh"
                p="10px"
            >
                {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>};
                {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>};
            </Box>
        </div>
    );
}

export default Chatpage;