// import {convertToUTCFormatted} from '@/services/dateUtils';
import {
    send_message_to_chat_Request
} from '@/services/wsRequests'


//get_user_info
export function handleGetUserInfo(context, message){
    console.log("Handler get_user_info:", message);
    let body = message.body;

    console.log('User Name:', body.user_info.name);
    console.log('User ID:', body.user_info.id);
    context.this_user_id= body.user_info.id;
    context.user_name = body.user_info.name;
}


//get_waiting_chats
export async function handleGetWaitingChats(context, message) {
    console.log("Handler get_waiting_chats:", message);
    let body = message.body; 
    let chats = JSON.parse(body.chats.replace(/'/g, '"'));

    console.log('waiting_chats:', chats);
    context.waiting_chats = context.waiting_chats.concat(chats);
}


//get_chats_by_user
export async function handleGetChatsByUser(context, message) {
    console.log("Handler get_chats_by_user:", message);
    let body = message.body; 
    let chats = JSON.parse(body.chats.replace(/'/g, '"'));

    console.log('user_chats:', chats);
    context.user_chats = context.user_chats.concat(chats);
}


// get_messages_by_waiting_chat
export async function handleGetMessagesByWaitingChat(context, message) {
    console.log("Handler get_messages_by_waiting_chat:", message);
    let body = message.body; 
    let messages = JSON.parse(body.messages.replace(/'/g, '"'));

    console.log('messages:', messages);
    if (messages.length>0){
        if (messages[0].chat_id==context.current_chat_id){
            context.current_chat_messages = context.current_chat_messages.concat(messages);
        }
    }
}


// get_messages_by_chat
export async function handleGetMessagesByChat(context, message) {
    console.log("Handler get_messages_by_chat:", message);
    let body = message.body; 
    let messages = JSON.parse(body.messages.replace(/'/g, '"'));

    console.log('messages:', messages);
    if (messages.length>0){
        if (messages[0].chat_id==context.current_chat_id){
            context.current_chat_messages = context.current_chat_messages.concat(messages);
        }
    }
}


// get_users_by_chat
export async function handleGetUsersByChat(context, message) {
    console.log("Handler get_users_by_chat:", message);
    let body = message.body; 
    let users = JSON.parse(body.users.replace(/'/g, '"'));

    console.log('users:', users);
    context.current_chat_users = context.current_chat_users.concat(users);
}
  

// send_message_to_chat
export async function handleSendMessageToChat(context, message) {
    console.log("Handler send_message_to_chat:", message);
    let body = message.body;
  
    let front_message_id = body.front_message_id;
    let id = body.message_id;
    console.log('front_message_id:', front_message_id);
    console.log('message_id:', id);
  
    context.current_chat_messages.forEach(chat_message => {
      if (chat_message.front_message_id !== undefined && chat_message.front_message_id === front_message_id) {
        chat_message.id = id;
      }
    });
  }
  


// connect_to_waiting_chat
export async function handleConnectToWaitingChat(context, message) {
    console.log("Handler connect_to_waiting_chat:", message);
    console.log(context);
    console.log(context.current_chat_waiting_connaction);
    
    if (context.current_chat_waiting_connaction){
        context.current_chat_waiting_connaction = false;
        
        context.waiting_messages.forEach(message => {
            send_message_to_chat_Request(context.connection.send.bind(context.connection), message);
        });    
        context.waiting_messages = [];
    }
}


// new_user_in_chat
export async function handleNewUserInChat(context, message) {
    console.log("Handler new_user_in_chat:", message);
    let body = message.body; 
    let chat = body.chat;
    let user = body.user;
    console.log(chat);
    console.log(user);

    if (chat.id == context.current_chat_id && user.id != context.this_user_id){
        context.current_chat_users.push(user);
        return;
    }
    
    let find_chat = false;
    find_chat = context.waiting_chats.some(waiting_chat => waiting_chat.id === chat.id);

    if (!find_chat) {
        find_chat = context.user_chats.some(user_chat => user_chat.id === chat.id);
    }

    if(!find_chat){
        context.user_chats.push(chat);
    }
}


//new_message
export async function handleNewMessage(context, message) {
    console.log("Handler new_message:", message);
    let body = message.body; 
    let msg = body.message;


    if (msg.chat_id == context.current_chat_id && msg.sender_id != context.this_user_id){
        
        context.current_chat_messages.push(msg);
    }
}


//delite_waiting_chats
export async function handleDeliteWaitingChats(context, message) {
    console.log("Handler delite_waiting_chats:", message);
    let body = message.body; 
    let chat = body.chat;

    let index = context.waiting_chats.findIndex(waiting_chat => waiting_chat.id === chat.id);

    if (index !== -1) {
        context.waiting_chats.splice(index, 1);
    }
}


//new_waiting_chats
export async function handleNewWaitingChats(context, message) {
    console.log("Handler new_waiting_chats:", message);
    let body = message.body; 
    let chat= body.chat;

    context.waiting_chats.push(chat);
}


//new_broadcast_message
export async function handleNewBroadcastMessage(context, message){
    console.log("Handler new_broadcast_message:", message);
    let body = message.body; 
    let msg = body.message;

    if (msg.chat_id == context.current_chat_id){
        context.current_chat_messages.push(msg);
    }
}



// add_user_to_chat
export async function handleAddUserToChat(context, message) {
    console.log("Handler add_user_to_chat:", message);
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
    "new_user_in_chat": handleNewUserInChat,
    "new_broadcast_message":handleNewBroadcastMessage,
    "new_message": handleNewMessage,
    "delite_waiting_chats":handleDeliteWaitingChats,
    "new_waiting_chats":handleNewWaitingChats,
};


export default handlers;