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


//get_chats_in_which_user_is_not_member
export async function handleGetChatsInWhichUserIsNotMember(context, message) {
    console.log("Handler get_chats_in_which_user_is_not_member:", message);
    let body = message.body; 
    let chats = body.chats;

    console.log('chats in which user is not member:', chats);

    chats.forEach((element) =>{
        element.is_not_connected=true;
        element.messages=[];
    });
    context.chats = context.chats.concat(chats);
}


//get_chats_by_user
export async function handleGetChatsByUser(context, message) {
    console.log("Handler get_chats_by_user:", message);
    let body = message.body; 
    let chats = body.chats;

    console.log('user_chats:', chats);
    chats.forEach((element) => {
        element.is_not_connected=false;
        element.messages=[];
    });
    context.chats = context.chats.concat(chats);
}



// get_messages_by_chat
export async function handleGetMessagesByChat(context, message) {
    console.log("Handler get_messages_by_chat:", message);
    let body = message.body; 
    let messages = body.messages;

    console.log('messages:', messages);
    if (messages.length>0){
        for (let index = 0; index < context.chats.length; index++) {
            if (context.chats[index].id == messages[0].chat_id){
                context.chats[index].messages = messages;
                break;
            }        
        }
    }
}


// get_users_by_chat
export async function handleGetUsersByChat(context, message) {
    console.log("Handler get_users_by_chat:", message);
    let body = message.body; 
    let users = body.users;
    let chat_id = body.chat_id;

    console.log('chat_id:', chat_id);
    console.log('users:', users);

    for (let index = 0; index < context.chats.length; index++) {
        if (context.chats[index].id == chat_id){
            context.chats[index].users = users;
            break;
        }        
    }
}

// send_message_to_chat
export async function handleSendMessageToChat(context, message) {
    console.log("Handler send_message_to_chat:", message);
    let body = message.body;
  
    let front_message_id = body.front_message_id;
    let id = body.message_id;
    console.log('front_message_id:', front_message_id);
    console.log('message_id:', id);

    for (let index = 0; index < context.chats.length; index++) {
        if(context.chats[index].id == message.chat_id){
            for (let i = 0; i < context.chats[index].messages.length; i++) {
                if(context.chats[index].messages[i].front_message_id==front_message_id){
                    context.chats[index].messages[i].id = id;
                    break;
                }
                
            }
            break;
        }
    }
}
  

// add_user_to_chat
export async function handleAddUserToChat(context, message) {
    console.log("Handler add_user_to_chat:", message);
    let body = message.body;
    let chat_users = body.chat_users;
    
    for (let index = 0; index < context.chats.length; index++) {
        if(context.chats[index].id == chat_users.chat_id){
            context.chats[index].waiting_connaction = false;

            context.chats[index].waiting_messages.forEach(message => {
                send_message_to_chat_Request(context.connection.send.bind(context.connection), message);
            }); 
            context.chats[index].waiting_messages=[];
            break;
        }
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


    for (let index = 0; index < context.chats.length; index++) {
        if(context.chats[index].id == chat.id){
            context.chats[index].users.push(user);
            break;
        }
    }
}


//new_message
export async function handleNewMessage(context, message) {
    console.log("Handler new_message:", message);
    let body = message.body; 
    let msg = body.message;


    for (let index = 0; index < context.chats.length; index++) {
        if(context.chats[index].id == msg.chat_id){
            
            let is_fund = false;

            console.log(context.chats[index]);
            console.log(context.chats[index].messages);
            context.chats[index].messages.forEach(e=>console.log(e));
            console.log(msg);

            for (let i = 0; i < context.chats[index].messages.length; i++) {
                if(context.chats[index].messages[i].id==msg.id){
                    is_fund=true;
                    break;
                }
            }
            console.log(is_fund);
            if(!is_fund){
                context.chats[index].messages.push(msg);
            }
            break;
        }
    }
}


//new_chat
export async function handleNewChat(context, message) {
    console.log("Handler new_chat:", message);
    let body = message.body; 
    let chat= body.chat;

    chat.is_not_connected=true;
    chat.messages=[];

    context.chats.push(chat);
}



const handlers = {
    "get_user_info": handleGetUserInfo,
    "get_chats_in_which_user_is_not_member": handleGetChatsInWhichUserIsNotMember,
    "get_chats_by_user": handleGetChatsByUser,
    "get_users_by_chat": handleGetUsersByChat,
    "get_messages_by_chat": handleGetMessagesByChat,
    // "get_messages_by_waiting_chat": handleGetMessagesByWaitingChat,
    // "connect_to_waiting_chat": handleConnectToWaitingChat,
    "add_user_to_chat": handleAddUserToChat,
    "send_message_to_chat": handleSendMessageToChat,
    "new_user_in_chat": handleNewUserInChat,
    // "new_broadcast_message":handleNewBroadcastMessage,
    "new_message": handleNewMessage,
    // "delite_waiting_chats":handleDeliteWaitingChats,
    "new_chat":handleNewChat,
};


export default handlers;