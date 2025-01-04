import { 
    ref, 
} from 'vue';
import { 
    actionRequest,
    actionEventHandlers,
} from '@/services/messageHubService/websoket';
import { uuidv4 } from "@/utilities/uuid";
import generateVideoPreview from "@/utilities/VideoMiniature";

const loging = true;

export let user = ref({
    loading: false,
    name: null,
    id: null,
})

export function refreshUser(){
    user.value.loading = true;
    actionRequest(
        {
            id: uuidv4(),
            name: 'get_user_info',
            body: {}
        }
    ).then((action_res)=>{
        user.value.name = action_res.body.user_info.name;
        user.value.id = action_res.body.user_info.id;
        user.value.loading = false;
        if (loging) console.log("user", user);
    })
}

/**
 * chat = {
 *  id: int
 *  name: str (max_length=256)
 *  is_waiting_answer: bool
 *  is_archive: bool
 *  icon_url: str | None = Field(max_length=256)
 *  last_read_message_id: int | null
 *  user_in_chat: bool
 *  
 *  awaited_messages: []
 * 
 *  messages: c.m. messages_struct_init()
 *  send_requset_to_connect_to_chat
 * }
 */
export let chatContainer = ref({
    loading: false,
    chats: [],
});

/**
 * messages{
 *  init_loaded: bool
 * 
 *  loading_messages: bool
 *  scrolled_to_top: bool
 *  
 *  messages:{
 *   yaer{
 *       month{
 *             day{
 *                [
 *                   {
 *                     sender_id: int,
 *                     key: uuid,
 *                     messages: [
 *                        ref({})
 *                    ]
 *                   }
 *                ]
 *              }
 *            }
 *       }
 *      
 */
function messages_struct_init () {
    return {
        init_loaded: false,

        loading_messages: false,
        scrolled_to_top: false,

        messages: [],

        awaited_messages:[],
        send_requset_to_connect_to_chat: false
    }
}

export function refreshChats(){
    chatContainer.value.loading = true;
    actionRequest(
        {
            id: uuidv4(),
            name: 'get_chats_by_user',
            body: {}
        }
    ).then((action_res)=>{
        for (let item in action_res.body.chats){
            action_res.body.chats[item].messages = messages_struct_init();
        }

        chatContainer.value.chats = action_res.body.chats;
        chatContainer.value.loading = false;

        if (loging) console.log("chatContainer", chatContainer);
    })
}

actionEventHandlers["chat.update"] = function (action_res){
    let chat = action_res.body.chat;
    let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat.id});
    
    if (chat_index>-1){
        chatContainer.value.chats[chat_index].name = chat.name;
        chatContainer.value.chats[chat_index].is_waiting_answer = chat.is_waiting_answer;
        chatContainer.value.chats[chat_index].is_archive = chat.is_archive;
        chatContainer.value.chats[chat_index].icon_url = chat.icon_url;
        if (chat.is_archive) chatContainer.value.chats[chat_index].user_in_chat = false;
    } else{
        chat.user_in_chat = false;
        chat.last_read_message_id = null;
        chat.messages = messages_struct_init();

        chatContainer.value.chats.push(chat);
    }
    if (loging) console.log("chat.update", chatContainer.value.chats[chat_index]);
}

/**
 * user{
 *  id: int
 *  name: str
 *  platform_id: int
 *  icon_url: str
 * }
 */
export let users = ref({})

export function refreshUsersFromChat(chat_id){
    actionRequest(
        {
            id: uuidv4(),
            name: 'get_users_by_chat',
            body: { 
                chat_id: chat_id 
            }
        }
    ).then((action_res)=>{
        let users_arr = action_res.body.users;
        for (let user in users_arr){
            if(users_arr[user].id in users.value){
                users.value[users_arr[user].id].name = users_arr[user].name;
                users.value[users_arr[user].id].platform_id = users_arr[user].platform_id;
                users.value[users_arr[user].id].icon_url = users_arr[user].icon_url;
            } else{
                users.value[users_arr[user].id] = users_arr[user];
            }
        }
        if (loging) console.log("refreshUsersFromChat", users.value);
    })
}

actionEventHandlers["chat.add.user"] = function (action_res){
    let user = action_res.body.user;

    if(user.id in users.value){
        users.value[user.id].name = user.name;
        users.value[user.id].platform_id = user.platform_id;
        users.value[user.id].icon_url = user.icon_url;
    } else{
        users.value[user.id] = user;
    }
    if (loging) console.log("chat.add.user", users.value);
}


export function refreshMessagesFromChat(chat_id){
    let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat_id});
    chatContainer.value.chats[chat_index].loading_messages = true;
    chatContainer.value.chats[chat_index].messages = {};

    actionRequest(
        {
            id: uuidv4(),
            name: 'get_messages_by_chat',
            body: {
              chat_id: chat_id,
              count: 50,
              offset_message_id: -1,
              include_messege: true,
              mode: "up",
            }
        }
    ).then((action_res)=>{
        let messages = action_res.body.messages;

        for (let item in messages){
            msg = convertMessageFromMH(messages[item]);
            insertMessage(msg);
        }

        let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat_id});
        chatContainer.value.chats[chat_index].loading_messages = false;
        chatContainer.value.chats[chat_index].init_loaded = true;
        if (messages.length < 50) chatContainer.value.chats[chat_index].scrolled_to_top = true;
        if (loging) console.log("refreshMessagesFromChat", messages);
    });
}

function insertMessage(message_ref){
    let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == message_ref.value.chat_id});
    if (chat_index>-1){
        let year = message_ref.value.sended_at.getYear();
        let month = message_ref.value.sended_at.getMonth();
        let day = message_ref.value.sended_at.getDay();

        if (! year in msg_arr){
            chatContainer.value.chats[chat_index].messages[year]={};
        }
        if (!month in chatContainer.value.chats[chat_index].messages[year]){
            chatContainer.value.chats[chat_index].messages[year][month]={};
        }
        if (!day in chatContainer.value.chats[chat_index].messages[year][month]){
            chatContainer.value.chats[chat_index].messages[year][month][day] = [];
        }
        if (chatContainer.value.chats[chat_index].messages[year][month][day].length == 0){
            chatContainer.value.chats[chat_index].messages[year][month][day].push(message_ref);
        }else{
            for (let i in chatContainer.value.chats[chat_index].messages[year][month][day]){
                if (chatContainer.value.chats[chat_index].messages[year][month][day][i].value.sended_at<message_ref.value.sended_at){
                    chatContainer.value.chats[chat_index].messages[year][month][day].splice(i,0,message_ref);
                }
            }
        }
    }
}

function convertMessageFromMH(message){
    res = ref({
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        sended_at: Date.parse(message.sended_at),
        text: message.text,
        attachments: message.attachments,
    });

    if ("videos" in res.value.attachments && res.value.attachments.videos.length>0){
        for (item in res.value.attachments.videos){
            res.value.attachments.videos[item].miniature = {
                loging: true,
                url: null,
            }

            generateVideoPreview(320, 240, res.value.attachments.videos[item].url).then((url_m)=>{
                res.value.attachments.videos[item].miniature.loging = false;
                res.value.attachments.videos[item].miniature.url = url_m;
            });
        }
    }

    return res;
}

export function getMessagesFromChatTop(chat_id){
    let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat_id});
    if (!chatContainer.value.chats[chat_index].loading_messages&&chatContainer.value.chats[chat_index].init_loaded&&!chatContainer.value.chats[chat_index].scrolled_to_top){
        chatContainer.value.chats[chat_index].loading_messages = true;

        actionRequest(
            {
                id: uuidv4(),
                name: 'get_messages_by_chat',
                body: {
                  chat_id: chat_id,
                  count: 50,
                  offset_message_id: Object.keys(Object.keys(Object.keys(chatContainer.value.chats[chat_index].messages)[0])[0])[0][0].value.id,
                  include_messege: false,
                  mode: "up",
                }
            }
        ).then((action_res)=>{
            let messages = action_res.body.messages;
    
            for (let item in messages){
                msg = convertMessageFromMH(messages[item]);
                insertMessage(msg);
            }
    
            let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat_id});
            chatContainer.value.chats[chat_index].loading_messages = false;
            if (messages.length < 50) chatContainer.value.chats[chat_index].scrolled_to_top = true;
            if (loging) console.log("getMessagesFromChatTop", messages);
        });
    }
}

/*
files{
    images: [
        ref({
            id: uuid,
            name: str,
            temp_url: str,
            progress: num,
            uploaded: bool,
            on_upload_progress: func,
            download_call_back: func,
            err_download_call_back: func,
            delete_call: func,
        })
    ],
    videos: [
        ref({
            id: uuid,
            name: str,
            temp_url: str,
            progress: num,
            uploaded: bool,
            on_upload_progress: func,
            download_call_back: func,
            err_download_call_back: func,
            delete_call: func,
            miniature: {
                loging: bool,
                url: bool,
            }
        })
    ],
    files: [],
}
*/

export function sendMessageToChat(chat_id, text, files){
    let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat.id});

    if (chat_index>-1){
        msg = ref({
            id: -1,
            chat_id: chat_id,
            sender_id: user.value.id,
            sended_at: new Date(),
            text: text,
            attachments: {
                use_ref: true,
                images: files.images,
                videos: files.videos,
                files: files.files,
            }
        });

        msg.value.attachments.images.forEach(item => {
            item.value.download_call_back = (response) =>{
                item.value.download_call_back(response);
                sendMessage(msg);
            };
            item.value.err_download_call_back = (error)=>{
                alert(`Ошибка загрузки файла ${sg.value.attachments.images.value.name}. Он будет удалён.`);
                item.value.delete_call();
                if (loging) console.log(error);
            }
            item.value.delete_call = () =>{
                msg.value.attachments.images.remove(item);
                sendMessage(msg);
            };
        });
        
        let func = (item) => {
            item.value.download_call_back = (response) =>{
                item.value.download_call_back(response);
                sendMessage(msg);
            };
            item.value.err_download_call_back = (error)=>{
                alert(`Ошибка загрузки файла ${sg.value.attachments.images.value.name}. Он будет удалён.`);
                item.value.delete_call();
                if (loging) console.log(error);
            }
            item.value.delete_call = () =>{
                msg.value.attachments.images.remove(item);
                sendMessage(msg);
            };
        };

        msg.value.attachments.images.forEach(func);
        msg.value.attachments.videos.forEach(func);
        msg.value.attachments.files.forEach(func);

        insertMessage(msg);

        if (!chatContainer.value.chats[chat_index].user_in_chat){
            if (!chatContainer.value.chats[chat_index].send_requset_to_connect_to_chat){
                chatContainer.value.chats[chat_index].send_requset_to_connect_to_chat = true;
                connectToChat(chat_id, 
                    (action_res)=>{
                        let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat.id});
                        chatContainer.value.chats[chat_index].send_requset_to_connect_to_chat = false;
                        chatContainer.value.chats[chat_index].user_in_chat = true;
                        
                        for (let i in chatContainer.value.chats[chat_index].awaited_messages){
                            sendMessage(chatContainer.value.chats[chat_index].awaited_messages[i]);
                        }
                        if (loging) console.log("connectToChat", action_res);
                    }
                );
            }
            chatContainer.value.chats[chat_index].awaited_messages.push(msg);
        } else{
            sendMessage(msg);
        }
    }
}

export function connectToChat(chat_id, call_back){
    actionRequest({
        id: uuidv4(),
        name: 'add_user_to_chat',
        body: { 
          chat_id: chat_id, 
          user_id: user.value.id, 
          event_id: uuidv4(),
        }
    }).then(call_back)
}

let ingnoreNewMessageEventId = []

function sendMessage(msg){
    if (!"sended" in msg.value || !msg.value.sended){
        let uploaded_files = true;
        
        let func = (item) =>{
            if (!item.value.uploaded) uploaded_files = false;
        };

        msg.value.attachments.images.forEach(func);
        msg.value.attachments.videos.forEach(func);
        msg.value.attachments.files.forEach(func);

        if (uploaded_files){
            msg.value.sended = true;
            sended_msg = convertInputMessageToMH(msg);

            event_id = uuidv4();
            ingnoreNewMessageEventId.push(event_id);

            actionRequest({
                id: uuidv4(),
                name: 'send_message_to_chat',
                body: {
                    message: message,
                    event_id: event_id,
                }
            }).then((action_res)=>{
                msg.value.id = action_res.body.message_id;
                if (loging) console.log("sendMessage", action_res);
            });
        }
    }
}

function convertInputMessageToMH(msg){
    let attachments = {
        images: [],
        videos: [],
        files: [],
    };

    msg.value.attachments.images.forEach((item) =>{
        attachments.images.push({
            name: item.value.name,
            url: item.value.url,
        });
    });
    msg.value.attachments.videos.forEach((item) =>{
        attachments.videos.push({
            name: item.value.name,
            url: item.value.url,
        });
    });
    msg.value.attachments.files.forEach((item) =>{
        attachments.files.push({
            name: item.value.name,
            url: item.value.url,
        });
    });

    return {
        id: msg.value.id,
        chat_id: msg.value.chat_id,
        sender_id: msg.value.sender_id,
        sended_at: msg.value.sended_at.toISOString(),
        text: msg.value.text,
        attachments: attachments,
        front_message_id: -1,
    }
}

actionEventHandlers["chat.new_message"] = function (action_res){
    let event_id = action_res.body.event_id;
    let message = action_res.body.message;

    let id_index = ingnoreNewMessageEventId.findIndex((item)=>{return event_id == item;})

    if (id_index==-1){
        msg = convertMessageFromMH(messages[item]);
        insertMessage(msg);
    }

    if (loging) console.log("chat.new_message", action_res);
}

export function removeChatToArchive(chat_id){
    actionRequest({
        id: uuidv4(),
        name: 'remove_to_archive',
        body: { 
          chat_id: chat_id,
          event_id: uuidv4(),
        }
    }).then((action_res)=>{
        let chat_index = chatContainer.value.chats.findIndex((item)=>{return item.id == chat.id});

        chatContainer.value.chats[chat_index].is_waiting_answer = false;
        chatContainer.value.chats[chat_index].is_archive = true;
        chatContainer.value.chats[chat_index].user_in_chat = false;

        if (loging) console.log("removeChatToArchive", action_res);
    });
}