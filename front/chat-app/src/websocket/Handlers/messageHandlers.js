// import {convertToUTCFormatted} from '@/services/dateUtils';



export function handleGetUserInfo(context, message){
    const validJsonString = JSON.stringify(message.body).replace(/'/g, '"');
    const parsedData = JSON.parse(validJsonString);
    console.log('User Name:', parsedData.user_info.name);
    console.log('User ID:', parsedData.user_info.id);
    context.thisUserId= parsedData.user_info.id;
    context.username = parsedData.user_info.name;
}

export async function handleGetWaitingChats(context, message) {
    const validJsonString = message.body.chats.replace(/'/g, '"');
    const parsedData = JSON.parse(validJsonString);
    context.waitingChats = parsedData.map(chat => ({ chatId: chat.id, name: chat.name }));
    console.log('waitingChats:', context.waitingChats);
}

export async function handleGetChatsByUser(context, message) {
    const validJsonString = message.body.chats.replace(/'/g, '"');
    const parsedData = JSON.parse(validJsonString);
    context.readChats = parsedData.map(chat => ({ chatId: chat.id, name: chat.name }));
    console.log('readChats:', context.readChats);

}


// get_users_by_chat
export async function handleGetUsersByChat(context, message) {
    console.log("Handler get_users_by_chat:", message);
  }
  


export async function handleGetMessagesByChat(context, message) {
    const validJsonString = message.body.messages.replace(/'/g, '"');
    const parsedData = JSON.parse(validJsonString);
    const chatId = parsedData[0]?.chat_id;

    const tempMessages = parsedData.map(msg => ({
        id: chatId,
        messageId: msg.id,
        name: msg.sender_id === context.thisUserId ? context.username : 'Сторонний отправитель',
        body: msg.text,
        sender_id: msg.sender_id,
        sended_at: (msg.sended_at)
    }));

    console.log('tempMessages:', tempMessages);

    if (!context.messages[chatId]) {
        context.messages[chatId] = [];
    }
    context.messages[chatId] = tempMessages;

    if (context.currentChatId === chatId) {
        context.currentChatMessages=[];
        context.currentChatMessages = context.messages[context.currentChatId];
        context.currentChatMessages = context.messages[context.currentChatId];
        context.currentChatMessages = context.currentChatMessages.map(msg => ({
        ...msg,
        sended_at: (msg.sended_at) // convertToUTCFormatted
        }));
    }

}

// get_messages_by_waiting_chat
export async function handleGetMessagesByWaitingChat(context, message) {
    console.log("Handler get_messages_by_waiting_chat:", message);
    
  }

// connect_to_waiting_chat
export async function handleConnectToWaitingChat(context, message) {
    console.log("Handler connect_to_waiting_chat:", message);
  }

// add_user_to_chat
export async function handleAddUserToChat(context, message) {
    console.log("Handler add_user_to_chat:", message);
  }
  
  // send_message_to_chat
  export async function handleSendMessageToChat(context, message) {
    console.log("Handler send_message_to_chat:", message);
  }
  

export async function handleNewWaitingChats(context, message) {

    const validJsonString = JSON.stringify(message.body.chat).replace(/'/g, '"');
    const parsedData = JSON.parse(validJsonString);

    const exists = context.waitingChats.some(chat => chat.chatId === parsedData.id);
    if (!exists) {
        context.waitingChats.push({ chatId: parsedData.id, name: parsedData.name });
    }

}


// new_user_in_chat
export async function handleNewUserInChat(message) {
    console.log("Handler new_user_in_chat:", message);
    console.log("User ID:", message.body.user_id);
    console.log("Chat ID:", message.body.chat_id);
}


export async function handleNewMessage(context, message) {


    const validJsonString = JSON.stringify(message.body.message).replace(/'/g, '"');


    const parsedData = JSON.parse(validJsonString);


    const chatId = parsedData.chat_id;


    const newMessage = {
        id: chatId,
        messageId: parsedData.id,
        name: parsedData.sender_id === context.thisUserId ? context.username : 'Сторонний отправитель',
        body: parsedData.text,
        sender_id: parsedData.sender_id,
        sended_at: (parsedData.sended_at)
    };
    console.log('newMessage:', newMessage);
    if (!context.messages[chatId]) {
        context.messages[chatId] = [];
    }

    const exists = context.messages[chatId].some(msg => msg.messageId === parsedData.id);
    if (!exists) {
        context.messages[chatId].push(newMessage);
    }

    if (context.currentChatId === chatId) {
        context.currentChatMessages = context.messages[context.currentChatId];
    }


}

const handlers = {
    "get_user_info": handleGetUserInfo,
    "get_waiting_chats": handleGetWaitingChats,
    "get_chats_by_user": handleGetChatsByUser,
    "get_users_by_chat": handleGetUsersByChat,
    "get_messages_by_chat": handleGetMessagesByChat,
    "get_messages_by_waiting_chat": handleGetMessagesByWaitingChat,
    "connect_to_waiting_chat": handleConnectToWaitingChat,
    "add_user_to_chat": handleAddUserToChat,
    "send_message_to_chat": handleSendMessageToChat,
    "new_user_in_chat": handleNewUserInChat

    // get_users_by_chat
    //"get_messages_by_chat": handleGetMessagesByChat,
    // get_messages_by_waiting_chat
    // connect_to_waiting_chat
    // add_user_to_chat
    // send_message_to_chat
    //"new_waiting_chats": handleNewWaitingChats,
    //"new_user_in_chat": handleNewUserInChat
};
 


export default handlers;
