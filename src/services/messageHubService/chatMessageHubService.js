import { uuidv4 } from '@/utilities/uuid';

const loging = true;
/*
chats{
    loaded: bool,
    chatsWhenLoaded: []
    chats:[],
    curentChat:{
        is_not_connected: bool,
        messages: [],
        scrolled_to_down: bool,
        scrolled_to_top: bool,
        last_message_send_at: date,
    }
}
*/

function prepareChat(chat){
    chat.is_not_connected = !chat.user_in_chat
    chat.messages = [];
    chat.scrolled_to_down = false;
    chat.scrolled_to_top= false;

    chat.last_message_send_at = new Date(chat.last_message_send_at);
    const timeZoneOffset = chat.last_message_send_at.getTimezoneOffset() / 60; 
    chat.last_message_send_at = new Date(chat.last_message_send_at.getTime() - timeZoneOffset * 60 * 60 * 1000);
}

export function refreshChats(context, MessageHubService){
    context.chats.loaded = false;
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'get_chats_by_user',
            body: {}
        }
    ).then((action_res)=>{
        let chats = action_res.body.chats;
        chats.forEach(prepareChat);

        context.chats.chatsWhenLoaded.forEach(chat=>{
            let index = chats.findIndex((item)=>{item.id == chat.id})
            if (index==-1) chats.push(chat);
        })

        chats.sort((a,b)=>{ 
            if (a.last_message_send_at === null) {
                if (b.last_message_send_at === null) return 0;
                else return 1;
            } else{
                if (b.last_message_send_at === null) return -1;
                return b.last_message_send_at-a.last_message_send_at;
            }
        });

        context.chats.chats = chats;
        context.chats.loaded = true;
        context.chats.chatsWhenLoaded = [];
        if (loging) console.log("refreshChats", context.chats);
    })
}

export function getUsersByChatRequest(context, MessageHubService, chat_id){
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'get_users_by_chat',
            body: { chat_id: chat_id }
        }
    ).then((action_res)=>{
        let body = action_res.body; 
        let users = body.users;
        let chat_id = body.chat_id;

    
        for (let index = 0; index < context.chats.chats.length; index++) {
            if (context.chats.chats[index].id === chat_id){
                context.chats.chats[index].users = users;
                break;
            }        
        }

        if (loging) console.log("getUsersByChatRequest", action_res);
    })
}

export function getMessagesByChat(context, MessageHubService, chat, count = 50, offsetMessageId = -1, include_messege=false, mode="up" ){
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'get_messages_by_chat',
            body: {
              chat_id: chat.id,
              count: count,
              offset_message_id: offsetMessageId,
              include_messege: include_messege,
              mode: mode,
            }
        }
    ).then((action_res)=>{
        let body = action_res.body; 
        let messages = body.messages;
        let mode = body.mode;
        let include_messege = body.include_messege;
        let offset_message_id = body.offset_message_id;
        let chat_id = body.chat_id;
    
        messages.forEach(messagePrepere);
        console.log('messages:', messages);
    
        let chat_index = context.chats.chats.findIndex((item)=> {return item.id == chat_id;})
        if (chat_index>-1){
            if (offset_message_id==-1){
    
                if (messages.length>0){
                    context.chats.chats[chat_index].messages = messages.concat( (context.chats.chats[chat_index].messages?context.chats.chats[chat_index].messages:[]));
                }
    
                for (let i in context.chats.chats[chat_index].down_await_messages){
                    let find = false;
                    for (let j = context.chats.chats[chat_index].messages.length-1; j>context.chats.chats[chat_index].messages.length-51; j--){
                        if (context.chats.chats[chat_index].down_await_messages[i].id==context.chats.chats[chat_index].messages[j].id){
                            find = true;
                            break;
                        }
                    }
                    if (!find){
                        context.chats.chats[chat_index].messages.push(context.chats.chats[chat_index].down_await_messages[i]);
                    }
                }
    
                context.chats.chats[chat_index].await_messages = false;
                if (messages.length<50) context.chats.chats[chat_index].scrolled_to_top=true;
        
                context.chats.chats[chat_index].await_down_messages = false;
                context.chats.chats[chat_index].down_await_messages = [];
                context.chats.chats[chat_index].scrolled_to_down=true;
            }
            else if (mode == "up" && !include_messege){     
                if (messages.length>0){
                    context.chats.chats[chat_index].messages = messages.concat( (context.chats.chats[chat_index].messages?context.chats.chats[chat_index].messages:[]));
                }
    
                context.chats.chats[chat_index].await_messages = false;
                if (messages.length<50) context.chats.chats[chat_index].scrolled_to_top=true;
            }     
            else if (mode == "up" && include_messege){
                if (messages.length>0){
                    context.chats.chats[chat_index].messages = messages.concat( (context.chats.chats[chat_index].messages?context.chats.chats[chat_index].messages:[]));
                }
    
                context.chats.chats[chat_index].await_messages = false;
                if (messages.length<50) context.chats.chats[chat_index].scrolled_to_top=true;
            } 
            else if (mode == "down"&& !include_messege){
                if (messages.length>0){
                    context.chats.chats[chat_index].messages = (context.chats.chats[chat_index].messages?context.chats.chats[chat_index].messages:[]).concat(messages);
                }
    
                context.chats.chats[chat_index].await_down_messages = false;
                if (messages.length<50) {
                    for (let i in context.chats.chats[chat_index].down_await_messages){
                        let find = false;
                        for (let j = context.chats.chats[chat_index].messages.length-1; j>context.chats.chats[chat_index].messages.length-51; j--){
                            if (context.chats.chats[chat_index].down_await_messages[i].id==context.chats.chats[chat_index].messages[j].id){
                                find = true;
                                break;
                            }
                        }
                        if (!find){
                            context.chats.chats[chat_index].messages.push(context.chats.chats[chat_index].down_await_messages[i]);
                        }
                    }
    
                    context.chats.chats[chat_index].scrolled_to_down=true;
                    context.chats.chats[chat_index].down_await_messages = [];
                }
            }
        }
    
        if (loging) console.log("getMessagesByChat", action_res);
    })
}

function messagePrepere(msg){
    if (msg.sended_at[msg.sended_at.length-1]=="Z"){
        msg.sended_at = new Date(msg.sended_at);
    }
    else{
        msg.sended_at = new Date(msg.sended_at);
        const timeZoneOffset = msg.sended_at.getTimezoneOffset() / 60; 
        msg.sended_at = new Date(msg.sended_at.getTime() - timeZoneOffset * 60 * 60 * 1000);
    }

    if ("attachments" in msg){
        if ("images" in msg.attachments){
            msg.attachments.images.forEach((item)=>{item.id = uuidv4();});
        }

        if ("videos" in msg.attachments){
            msg.attachments.videos.forEach((item)=>{item.id = uuidv4();});
        }

        if ("files" in msg.attachments){
            msg.attachments.files.forEach((item)=>{item.id = uuidv4();});
        }
    }
    return msg;
}


/**
 * Отправляет запрос на подключение к ожидающему чату по его идентификатору chatId.
 */
export function addUserToChatRequest(context, MessageHubService, chat_id, user_id){
    let event_id = uuidv4();
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'add_user_to_chat',
            body: { 
              chat_id: chat_id, 
              user_id:user_id, 
              event_id: event_id,
            }
        }
    ).then((action_res)=>{
        let body = action_res.body;
        let chat_users = body.chat_users;
        
        for (let index = 0; index < context.chats.chats.length; index++) {
            if(context.chats.chats[index].id == chat_users.chat_id){
                context.chats.chats[index].waiting_connaction = false;
                context.chats.chats[index].is_not_connected = false;
                context.chats.chats[index].is_waiting_answer = false;
                context.chats.chats[index].waiting_messages.forEach(message => {
                    sendMessageToChat(context, MessageHubService, message);
                }); 
                context.chats.chats[index].waiting_messages=[];
                break;
            }
        }
        context.chats.current_chat_is_waiting = false;

        if (loging) console.log("addUserToChatRequest", action_res);
    })
}





/**
 * Создает сообщение для отправки в чат.
 */
export function create_message(msg){
  let attachments = {
    images: [],
    videos: [],
    files: [],
  }

  msg.attachments.images.forEach(element => {
    attachments.images.push({
      url: element.value.uploaded_url,
      name: element.value.name,
    });
  });

  msg.attachments.videos.forEach(element => {
    attachments.videos.push({
      url: element.value.uploaded_url,
      name: element.value.name,
      miniature:{
        url: element.value.miniature.uploaded_url
      }
    });
  });

  msg.attachments.files.forEach(element => {
    attachments.files.push({
      url: element.value.uploaded_url,
      name: element.value.name,
    });
  });

  return {
    id: msg.id,
    chat_id: msg.chat_id,
    sender_id: msg.sender_id,
    sended_at: msg.sended_at.toISOString(),
    text: msg.text,
    front_message_id: msg.front_message_id,
    attachments: attachments,
  }
}

let ignoreEventId=[];
/**
 * Отправляет запрос на отправку сообщения в чат.
 */
export function sendMessageToChat(context, MessageHubService, message){
    let event_id = uuidv4();
    ignoreEventId.push(event_id);
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'send_message_to_chat',
            body: {
              message: message,
              event_id:event_id,
            }
        }
    ).then((action_res)=>{
        let body = action_res.body;
      
        let front_message_id = body.front_message_id;
        let id = body.message_id;
        let chat_id = body.chat_id;
    
        for (let index = 0; index < context.chats.chats.length; index++) {
            if(context.chats.chats[index].id == chat_id){
    
                for (let i = 0; i < context.chats.chats[index].messages.length; i++) {
                    
                    
                    if(context.chats.chats[index].messages[i].front_message_id === front_message_id){
                        
                        if (context.chats.chats[index].last_read_message_id == context.chats.chats[index].messages[i].id){
                            setLastReadMessageIdInChatTimeout(context, MessageHubService, context.chats.chats[index].id, id);
                            context.chats.chats[index].last_read_message_id = id;
                        }
    
                        context.chats.chats[index].messages[i].id = id;
                        break;
                    }
                    
                }
                break;
            }
        }

        if (loging) console.log("sendMessageToChat", action_res);
    })
}

export function removeChatToArchive(context, MessageHubService, chat_id){
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'remove_to_archive',
            body: { 
              chat_id: chat_id,
              event_id: uuidv4(),
            }
        }
    ).then((action_res)=>{
        if (loging) console.log("removeChatToArchive", action_res);
    })
}


/**
 * Отправляет запрос на установление последнего прочитанного сообщения в чате.
 */
export function setLastReadMessageIdInChat(context, MessageHubService, chat_id, last_read_message_id){
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'set_last_read_message_id',
            body: { 
              chat_id: chat_id,
              last_read_message_id: last_read_message_id,
              event_id: uuidv4(), 
            }
        }
    ).then((action_res)=>{
        if (loging) console.log("setLastReadMessageIdInChat", action_res);
    })
}

let setLastReadMessageIdInChatTimers = {};

export function setLastReadMessageIdInChatTimeout(context, MessageHubService, chat_id, last_read_message_id){

    if (chat_id in setLastReadMessageIdInChatTimers){
        if (setLastReadMessageIdInChatTimers[chat_id].last_read_message_id<last_read_message_id){
            setLastReadMessageIdInChatTimers[chat_id].last_read_message_id = last_read_message_id;
            clearTimeout(setLastReadMessageIdInChatTimers[chat_id].timer);
    
            setLastReadMessageIdInChatTimers[chat_id].timer = setTimeout(() => {
                setLastReadMessageIdInChat(context, MessageHubService, chat_id, last_read_message_id);
            }, 500);
        }
    }
    else{
        let dict = {};
        dict.last_read_message_id = last_read_message_id;
        dict.timer = setTimeout(() => {
            setLastReadMessageIdInChat(context, MessageHubService, chat_id, last_read_message_id);
        }, 500);
        setLastReadMessageIdInChatTimers[chat_id] = dict;
    }

    setLastReadMessageIdInChat(context, MessageHubService, chat_id, last_read_message_id);
}

/**
 * Отправляет запрос на удаление сообщения в чате
 */
export function deleteMessageInChat(context, MessageHubService, message_id){
    let event_id = uuidv4();
    ignoreEventId.push(event_id);
    MessageHubService.actionRequest(
        {
            id: uuidv4(),
            name: 'delete_message',
            body: { 
              message_id: message_id,
              event_id: event_id, 
            }
        }
    ).then((action_res)=>{
        if (loging) console.log("deleteMessageInChat", action_res);
    })
}


// events

// new_user_in_chat
export async function handleNewUserInChat(action_res) {
    console.log("Handler new_user_in_chat:", action_res);
    let body = action_res.body; 
    let chat = body.chat;
    let user = body.user;

    for (let index = 0; index < this.chats.chats.length; index++) {
        if(this.chats.chats[index].id == chat.id){
            if (this.chats.chats[index].users) this.chats.chats[index].users.push(user);
            if (user.id==this.user.id) this.chats.chats[index].is_not_connected=false;
            break;
        }
    }
}

//new_message реджект 
export async function handleNewMessage(action_res) {
    console.log("Handler new_message:", action_res);
    let body = action_res.body; 
    let msg = messagePrepere(body.message);
    let event_id = body.event_id;

    let event_index = ignoreEventId.findIndex((item)=>{return item == event_id;});

    if (event_index==-1){
        let chat_index = this.chats.chats.findIndex((item)=>{return item.id == msg.chat_id;});
        if (chat_index>-1){
            if (this.chats.chats[chat_index].await_down_messages){
                this.chats.chats[chat_index].down_await_messages.push(msg);
            }
            if (this.chats.chats[chat_index].scrolled_to_down){
                this.chats.chats[chat_index].messages.push(msg);
            }

            if (msg.sender_id!=this.user.id){
                this.chats.chats[chat_index].count_unredeble_messgaes+=1;
            }

            if (this.chats.chats[chat_index].last_message_send_at<msg.sended_at){
                this.chats.chats[chat_index].last_message_send_at = msg.sended_at;

                this.chats.chats.sort((a,b)=>{ 
                    if (a.last_message_send_at === null) {
                        if (b.last_message_send_at === null) return 0;
                        else return 1;
                    } else{
                        if (b.last_message_send_at === null) return -1;
                        return b.last_message_send_at-a.last_message_send_at;
                    }
                });
            }
        }
    }
}


//chat.update
export async function handleChatUpdate(action_res) {
    console.log("handleChatUpdate", action_res);
    let body = action_res.body; 
    let chat = body.chat; 

    let find_chat = null;
    for (let i = 0; i < this.chats.chats.length; i++){
        if (this.chats.chats[i].id == chat.id){
            find_chat =this.chats.chats[i];
            // index_chat = i;
            break;
        }
    }
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

        chat.last_message_send_at = new Date(chat.last_message_send_at);
        const timeZoneOffset = chat.last_message_send_at.getTimezoneOffset() / 60; 
        chat.last_message_send_at = new Date(chat.last_message_send_at.getTime() - timeZoneOffset * 60 * 60 * 1000);

        this.chats.chats.push(chat);

        this.chats.chats.sort((a,b)=>{ 
            if (a.last_message_send_at === null) {
                if (b.last_message_send_at === null) return 0;
                else return 1;
            } else{
                if (b.last_message_send_at === null) return -1;
                return b.last_message_send_at-a.last_message_send_at;
            }
        });
    }
}


export async function handleEventSetLastReadMessageId(action_res) {
    console.log("handleEventSetLastReadMessageId", action_res);
    let body = action_res.body; 
    let chat_id = body.chat_id; 
    let last_read_message_id = body.last_read_message_id;
    let count = body.count;

    let chat_index = this.chats.chats.findIndex((item)=>item.id == chat_id);
    if (chat_index>-1){
        if (this.chats.chats[chat_index].last_read_message_id == null || this.chats.chats[chat_index].last_read_message_id>-1 && this.chats.chats[chat_index].last_read_message_id<last_read_message_id){
            this.chats.chats[chat_index].last_read_message_id = last_read_message_id;
            this.chats.chats[chat_index].count_unredeble_messgaes = count;
        }
    }
}

export async function handleEventDeleteMessage(action_res) {
    console.log("handleEventDeleteMessage", action_res);
    let body = action_res.body; 
    let msg = body.message; 
    let event_id = body.event_id;

    let event_index = ignoreEventId.findIndex((item)=>{return item == event_id;});
    if (event_index==-1){
        let chat_index = this.chats.chats.findIndex((item)=>item.id == msg.chat_id);
        if (chat_index>-1){
            if (this.chats.chats[chat_index].last_read_message_id &&  msg.id>this.chats.chats[chat_index].last_read_message_id){
                this.chats.chats[chat_index].count_unredeble_messgaes -=1;
            }
            let message_index = this.chats.chats[chat_index].messages.findIndex((item)=>item.id == msg.id);
            if (message_index>-1){
                this.chats.chats[chat_index].messages[message_index].is_hide == true;
            }
        }
    }
}
