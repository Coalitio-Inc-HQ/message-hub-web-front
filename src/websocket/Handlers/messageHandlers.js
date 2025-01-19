// import {extract_time_from_timestamp_handler} from '@/services/dateUtils';
import { send_message_to_chat_Request, set_last_read_message_id_Request } from '@/services/wsRequests'
import { ignoreEventId } from '@/services/wsRequests';
// import {ref} from 'vue';
import { uuidv4 } from '@/utilities/uuid';
import { removeAction } from '../retry';
// import {generateVideoPreview} from "@/utilities/VideoMiniature";

//get_user_info
export function handleGetUserInfo(context, message){
    console.log("Handler get_user_info:", message);
    let body = message.body;

    //console.log('User Name:', body.user_info.name);
    //console.log('User ID:', body.user_info.id);
    context.this_user_id = body.user_info.id;
    context.user_name = body.user_info.name;

    removeAction(message.id);
}


// get_messages_by_chat
export async function handleGetMessagesByChat(context, message) {
    console.log("Handler get_messages_by_chat:", message);
    let body = message.body; 
    let messages = body.messages;
    let mode = body.mode;
    let include_messege = body.include_messege;
    let offset_message_id = body.offset_message_id;
    let chat_id = body.chat_id;

    messages.forEach(messagePrepere);
    console.log('messages:', messages);

    let chat_index = context.chats.findIndex((item)=> {return item.id == chat_id;})
    if (chat_index>-1){
        if (offset_message_id==-1){

            if (messages.length>0){
                context.chats[chat_index].messages = messages.concat( (context.chats[chat_index].messages?context.chats[chat_index].messages:[]));
            }

            for (let i in context.chats[chat_index].down_await_messages){
                let find = false;
                for (let j = context.chats[chat_index].messages.length-1; j>context.chats[chat_index].messages.length-51; j--){
                    if (context.chats[chat_index].down_await_messages[i].id==context.chats[chat_index].messages[j].id){
                        find = true;
                        break;
                    }
                }
                if (!find){
                    context.chats[chat_index].messages.push(context.chats[chat_index].down_await_messages[i]);
                }
            }

            context.chats[chat_index].await_messages = false;
            if (messages.length<50) context.chats[chat_index].scrolled_to_top=true;
    
            context.chats[chat_index].await_down_messages = false;
            context.chats[chat_index].down_await_messages = [];
            context.chats[chat_index].scrolled_to_down=true;
        }
        else if (mode == "up" && !include_messege){     
            if (messages.length>0){
                context.chats[chat_index].messages = messages.concat( (context.chats[chat_index].messages?context.chats[chat_index].messages:[]));
            }

            context.chats[chat_index].await_messages = false;
            if (messages.length<50) context.chats[chat_index].scrolled_to_top=true;
        }     
        else if (mode == "up" && include_messege){
            if (messages.length>0){
                context.chats[chat_index].messages = messages.concat( (context.chats[chat_index].messages?context.chats[chat_index].messages:[]));
            }

            context.chats[chat_index].await_messages = false;
            if (messages.length<50) context.chats[chat_index].scrolled_to_top=true;
        } 
        else if (mode == "down"&& !include_messege){
            if (messages.length>0){
                context.chats[chat_index].messages = (context.chats[chat_index].messages?context.chats[chat_index].messages:[]).concat(messages);
            }

            context.chats[chat_index].await_down_messages = false;
            if (messages.length<50) {
                for (let i in context.chats[chat_index].down_await_messages){
                    let find = false;
                    for (let j = context.chats[chat_index].messages.length-1; j>context.chats[chat_index].messages.length-51; j--){
                        if (context.chats[chat_index].down_await_messages[i].id==context.chats[chat_index].messages[j].id){
                            find = true;
                            break;
                        }
                    }
                    if (!find){
                        context.chats[chat_index].messages.push(context.chats[chat_index].down_await_messages[i]);
                    }
                }

                context.chats[chat_index].scrolled_to_down=true;
                context.chats[chat_index].down_await_messages = [];
            }
        }
    }

    removeAction(message.id);
}

function messagePrepere(msg){
    msg.sended_at = new Date(msg.sended_at);
    const timeZoneOffset = msg.sended_at.getTimezoneOffset() / 60; 
    msg.sended_at = new Date(msg.sended_at.getTime() - timeZoneOffset * 60 * 60 * 1000);

    if ("attachments" in msg){
        if ("images" in msg.attachments){
            msg.attachments.images.forEach((item)=>{item.id = uuidv4();});
        }

        if ("videos" in msg.attachments){
            msg.attachments.videos.forEach((item)=>{item.id = uuidv4();});
            // msg.attachments.videos.forEach((item)=>{
            //     item.id = uuidv4();
            //     let ref_m = ref({
            //         loading: true,
            //         url: null,
            //     });

            //     item.miniature = ref_m;

            //     generateVideoPreview(320, 240,item.url).then((url)=>{
            //         ref_m.value = {
            //             loading: false,
            //             url: url,
            //         };
            //     }).catch((e)=>{console.log(e);});
            // });
        }

        if ("files" in msg.attachments){
            msg.attachments.files.forEach((item)=>{item.id = uuidv4();});
        }
    }
    return msg;
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

    removeAction(message.id);
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
                
                
                if(context.chats[index].messages[i].front_message_id === front_message_id){
                    
                    if (context.chats[index].last_read_message_id == context.chats[index].messages[i].id){
                        set_last_read_message_id_Request(context, context.chats[index].id, id);
                        context.chats[index].last_read_message_id = id;
                    }

                    context.chats[index].messages[i].id = id;
                    break;
                }
                
            }
            break;
        }
    }

    removeAction(message.id);
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
                send_message_to_chat_Request(context, message);
            }); 
            context.chats[index].waiting_messages=[];
            break;
        }
    }
    context.current_chat_is_waiting = false;

    removeAction(message.id);
}


// // new_user_in_chat
// export async function handleNewUserInChat(context, message) {
//     console.log("Handler new_user_in_chat:", message);
//     let body = message.body; 
//     let chat = body.chat;
//     let user = body.user;
//     console.log(chat);
//     console.log(user);


//     for (let index = 0; index < context.chats.length; index++) {
//         if(context.chats[index].id == chat.id){
//             context.chats[index].users.push(user);
//             break;
//         }
//     }
// }

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
            if (context.chats[index].users) context.chats[index].users.push(user);
            if (user.id==context.this_user_id) context.chats[index].is_not_connected=false;
            break;
        }
    }
}


// //new_message реджект 
// export async function handleNewMessage(context, message) {
//     console.log("Handler new_message:", message);
//     let body = message.body; 
//     let msg = body.message;

//     if (msg.chat_id == context.current_chat.id && msg.sender_id != context.this_user_id) {
//         let is_found = false;

//         for (let index = 0; index < context.chats.length; index++) {
//             if (context.chats[index].id == msg.chat_id) {
                
//                 for (let i = 0; i < context.chats[index].messages.length; i++) {
//                     console.log(`Сообщение по индексу ${i}, ID сообщения: ${context.chats[index].messages[i].id}`);
                    
//                     if (context.chats[index].messages[i].id == msg.id && 
//                         context.chats[index].messages[i].sended_at == msg.sended_at && 
//                         context.chats[index].messages[i].sender_id == msg.sender_id) {
                        
//                         is_found = true;
//                         break;
//                     }
//                 }

//                 console.log("Дубликат сообщения: ", is_found);
//                 if (!is_found) {
//                     context.chats[index].messages.push(msg);
//                 }
//                 break;
//             }
//         }
//     }
// }


//new_message реджект 
export async function handleNewMessage(context, message) {
    console.log("Handler new_message:", message);
    let body = message.body; 
    let msg = messagePrepere(body.message);
    let event_id = body.event_id;

    let event_index = ignoreEventId.findIndex((item)=>{return item == event_id;});

    if (event_index==-1){
        let chat_index = context.chats.findIndex((item)=>{return item.id == msg.chat_id;});
        if (chat_index>-1){
            if (context.chats[chat_index].await_down_messages){
                context.chats[chat_index].down_await_messages.push(msg);
            }
            if (context.chats[chat_index].scrolled_to_down){
                context.chats[chat_index].messages.push(msg);
            }

            if (msg.sender_id!=context.this_user_id){
                context.chats[chat_index].count_unredeble_messgaes+=1;
            }
        }
    }

    // if (msg.chat_id == context.current_chat.id && msg.sender_id != context.this_user_id) {
    //     let is_found = false;

    //     for (let index = 0; index < context.chats.length; index++) {
    //         if (context.chats[index].id == msg.chat_id) {
                
    //             for (let i = 0; i < context.chats[index].messages.length; i++) {
    //                 console.log(`Сообщение по индексу ${i}, ID сообщения: ${context.chats[index].messages[i].id}`);
                    
    //                 if (context.chats[index].messages[i].id == msg.id && 
    //                     context.chats[index].messages[i].sended_at == msg.sended_at && 
    //                     context.chats[index].messages[i].sender_id == msg.sender_id) {
                        
    //                     is_found = true;
    //                     break;
    //                 }
    //             }

    //             console.log("Дубликат сообщения: ", is_found);
    //             if (!is_found) {
    //                 context.chats[index].messages.push(msg);
    //             }
    //             break;
    //         }
    //     }
    // }
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
        chats[i].scrolled_to_down = false;
        chats[i].scrolled_to_top= false;
    }
    context.chats = context.chats.concat(chats);

    removeAction(message.id);
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
        chat.scrolled_to_down = false;
        chat.scrolled_to_top= false;
        context.chats.push(chat);
    }
}


export async function handleRemoveChatToArchive(context, message) {
    console.log("handleRemoveChatToArchive", message);
    let body = message.body; 
    let chat_id = body.chat_id; 
    console.log("Чат отправлен в архив", chat_id);
    removeAction(message.id);
}

export async function handleEventSetLastReadMessageId(context, message) {
    console.log("handleEventSetLastReadMessageId", message);
    let body = message.body; 
    let chat_id = body.chat_id; 
    let last_read_message_id = body.last_read_message_id;
    let count = body.count;

    let chat_index = context.chats.findIndex((item)=>item.id == chat_id);
    if (chat_index>-1){
        if (context.chats[chat_index].last_read_message_id == null || context.chats[chat_index].last_read_message_id>-1 && context.chats[chat_index].last_read_message_id<last_read_message_id){
            context.chats[chat_index].last_read_message_id = last_read_message_id;
            context.chats[chat_index].count_unredeble_messgaes = count;
        }
    }
}

export async function handleSetLastReadMessageId(context, message) {
    console.log("handleSetLastReadMessageId", message);
    removeAction(message.id);
}

const handlers = {
    "get_user_info": handleGetUserInfo,
    "get_users_by_chat": handleGetUsersByChat,
    "get_messages_by_chat": handleGetMessagesByChat,
    "add_user_to_chat": handleAddUserToChat,
    "send_message_to_chat": handleSendMessageToChat,
    // "new_user_in_chat": handleNewUserInChat,
    "chat.add.user": handleNewUserInChat,
    // "new_message": handleNewMessage,
    "chat.new_message": handleNewMessage,
    "new_chat":handleNewChat,
    "get_chats": handleGetChats,
    "chat.update":handleChatUpdate,
    "remove_to_archive":handleRemoveChatToArchive,
    "chat.set.last_read_message_id": handleEventSetLastReadMessageId,
    "set_last_read_message_id": handleSetLastReadMessageId,
};


export default handlers;