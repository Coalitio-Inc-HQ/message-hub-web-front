import {extract_time_from_timestamp_handler} from '@/services/dateUtils';
import { send_message_to_chat_Request } from '@/services/wsRequests'


//get_user_info
export function handleGetUserInfo(context, message){
    console.log("Handler get_user_info:", message);
    let body = message.body;

    //console.log('User Name:', body.user_info.name);
    //console.log('User ID:', body.user_info.id);
    context.this_user_id = body.user_info.id;
    context.user_name = body.user_info.name;
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
                for (let i = 0; i < messages.length; i++) {
                    messages[i].sended_at = extract_time_from_timestamp_handler(messages[i].sended_at);
                }
               
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
    //  let chat_id = parseInt(body.chat_id, 10);
    console.log('chat_id:', chat_id);
    console.log('users:', users);

    for (let index = 0; index < context.chats.length; index++) {
        if (context.chats[index].id === chat_id){
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
    let chat_id = body.chat_id;
    console.log('front_message_id:', front_message_id);
    console.log('message_id:', id);
    console.log('chat_id:', chat_id);

    for (let index = 0; index < context.chats.length; index++) {
        if(context.chats[index].id == chat_id){

            for (let i = 0; i < context.chats[index].messages.length; i++) {
                
                
                if(context.chats[index].messages[i].front_message_id !== undefined && 
                   context.chats[index].messages[i].front_message_id === front_message_id){
                    
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
            context.chats[index].is_not_connected = false;
            context.chats[index].is_waiting_answer = false;
            console.log("is_not_connected: ", context.chats[index].is_not_connected)
            context.chats[index].waiting_messages.forEach(message => {
                send_message_to_chat_Request(context.connection.send.bind(context.connection), message);
            }); 
            context.chats[index].waiting_messages=[];
            break;
        }
    }
    context.current_chat_is_waiting = false;

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


//new_message реджект 
export async function handleNewMessage(context, message) {
    console.log("Handler new_message:", message);
    let body = message.body; 
    let msg = body.message;

    if (msg.chat_id == context.current_chat.id && msg.sender_id != context.this_user_id) {
        let is_found = false;

        for (let index = 0; index < context.chats.length; index++) {
            if (context.chats[index].id == msg.chat_id) {
                
                for (let i = 0; i < context.chats[index].messages.length; i++) {
                    console.log(`Сообщение по индексу ${i}, ID сообщения: ${context.chats[index].messages[i].id}`);
                    
                    if (context.chats[index].messages[i].id == msg.id && 
                        context.chats[index].messages[i].sended_at == msg.sended_at && 
                        context.chats[index].messages[i].sender_id == msg.sender_id) {
                        
                        is_found = true;
                        break;
                    }
                }

                console.log("Дубликат сообщения: ", is_found);
                if (!is_found) {
                    context.chats[index].messages.push(msg);
                }
                break;
            }
        }
    }
}



//new_chat
export async function handleNewChat(context, message) {
    console.log("Handler new_chat: ", message);
    let body = message.body; 
    let chat= body.chat;

    chat.is_not_connected=true;
    chat.messages=[];

    context.chats.push(chat);
}


//get_chats
export async function handleGetChats(context, message) {
    console.log("Handler get_chats:", message);
    let body = message.body; 
    let chats = body.chats;

    console.log('user_chats:', chats);
    for (let i = 0; i < chats.length; i++) {
        // if (chats[i].last_read_message_id == null){
        //     chats[i].is_not_connected = true;
        // }
        // else{
        //     chats[i].is_not_connected = false;
        // }
        chats[i].is_not_connected = !chats[i].user_in_chat
        chats[i].messages = [];
    }
    context.chats = context.chats.concat(chats);
}

//chat.update
export async function handleChatUpdate(context, message) {
    console.log("handleChatUpdate", message);
    let body = message.body; 
    let chat = body.chat; 

    let find_chat = null;
    // let index_chat = null;
    for (let i = 0; i < context.chats.length; i++){
        if (context.chats[i].id == chat.id){
            find_chat =context.chats[i];
            // index_chat = i;
            break;
        }
    }
    // if (find_chat){
    //     if (chat.is_waiting_answer){
    //         find_chat.is_waiting_answer=chat.is_waiting_answer;
    //         find_chat.is_archive=chat.is_archive;
    //         // Добавить сброс участия в чате
    //     } else{
    //         if (find_chat.is_not_connected && !find_chat.waiting_connaction){
    //             context.chats.splice(index_chat, 1);
    //             context.current_chat=null;
    //         } else{
    //             find_chat.is_waiting_answer=chat.is_waiting_answer;
    //             find_chat.is_archive=chat.is_archive;
    //         }
    //     }
    // }
    // else{
    //     if (chat.is_waiting_answer){
    //         chat.is_not_connected = true;
    //         chat.messages = [];
    //         context.chats.push(chat);
    //     } else{
    //         // is_waiting_answer == False значит чат уже приветный
    //     }
    // }
    if (find_chat){
        find_chat.is_waiting_answer=chat.is_waiting_answer;
        find_chat.is_archive=chat.is_archive;
        // Добавить сброс участия в чате
        // при is_archive == True
        if (chat.is_archive){
            find_chat.is_not_connected=true
        }
    }
    else{
        // is_archive == True?
        chat.is_not_connected = true;
        chat.messages = [];
        context.chats.push(chat);
    }
}


const handlers = {
    "get_user_info": handleGetUserInfo,
    "get_users_by_chat": handleGetUsersByChat,
    "get_messages_by_chat": handleGetMessagesByChat,
    "add_user_to_chat": handleAddUserToChat,
    "send_message_to_chat": handleSendMessageToChat,
    "new_user_in_chat": handleNewUserInChat,
    "new_message": handleNewMessage,
    "new_chat":handleNewChat,
    "get_chats": handleGetChats,
    "chat.update":handleChatUpdate,
};


export default handlers;