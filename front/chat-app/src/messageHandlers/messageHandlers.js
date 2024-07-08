// services/messageHandlers.js
import {convertToUTCFormatted} from '@/services/dateUtils';

export async function handleNewMessage(context, message) {
    console.log(`____________new_message____________`);
    console.log('------------------------------------------------------');
    console.log('Получили данные по new_message:', message.body);

    const validJsonString = JSON.stringify(message.body.message).replace(/'/g, '"');
    console.log('Обработка validJsonString:', validJsonString);

    const parsedData = JSON.parse(validJsonString);
    console.log('Обработка parsedData:', parsedData);

    const chatId = parsedData.chat_id;
    console.log('Идентификатор чата:', chatId);

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

    console.log('Обновленный messages:', context.messages);
    console.log('------------------------------------------------------');
}

export async function handleGetWaitingChats(context, message) {
    console.log('____________get_waiting_chats____________');
    console.log('------------------------------------------------------');
    console.log('Получили данные по get_waiting_chats:', message.body);
    const validJsonString = message.body.chats.replace(/'/g, '"');
    console.log('Обработка validJsonString:', validJsonString);
    const parsedData = JSON.parse(validJsonString);
    console.log('Обработка parsedData:', parsedData);
    context.waitingChats = parsedData.map(chat => ({ chatId: chat.id, name: chat.name }));
    console.log('Обновленный waitingChats:', context.waitingChats); 
    console.log('------------------------------------------------------');
}

export async function handleGetChatsByUser(context, message) {
    console.log('____________get_chats_by_user____________');
    console.log('------------------------------------------------------');
    console.log('Получили данные по get_chats_by_user:', message.body);
    const validJsonString = message.body.chats.replace(/'/g, '"');
    console.log('Обработка validJsonString:', validJsonString);
    const parsedData = JSON.parse(validJsonString);
    console.log('Обработка parsedData:', parsedData);
    context.readChats = parsedData.map(chat => ({ chatId: chat.id, name: chat.name }));
    console.log('Обновленный  readChats:', context.readChats); 
    console.log('------------------------------------------------------');
}




export async function handleGetMessagesByChat(context, message) {
    console.log(`____________get_messages_by_chat____________`);
    console.log('------------------------------------------------------');
    console.log('Получили данные по get_messages_by_chat:', message.body);
    const validJsonString = message.body.messages.replace(/'/g, '"');
    console.log('Обработка validJsonString:', validJsonString);
    const parsedData = JSON.parse(validJsonString);
    console.log('Обработка parsedData:', parsedData);
    const chatId = parsedData[0]?.chat_id;
    console.log('Обработка parsedData:', chatId);


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
        sended_at: convertToUTCFormatted(msg.sended_at)
        }));
    }
    console.log('currentChatMessages:', context.currentChatMessages);
    console.log('Обновленный messages:', context.messages);
    console.log('------------------------------------------------------');
}

export async function handleNewWaitingChats(context, message) {
    console.log('____________new_waiting_chats____________');
    console.log('------------------------------------------------------');
    console.log('Получили данные по new_waiting_chats:', message.body);
    const validJsonString = JSON.stringify(message.body.chat).replace(/'/g, '"');
    console.log('Обработка validJsonString:', validJsonString);
    const parsedData = JSON.parse(validJsonString);
    console.log('Обработка parsedData:', parsedData);

    const exists = context.waitingChats.some(chat => chat.chatId === parsedData.id);
    if (!exists) {
        context.waitingChats.push({ chatId: parsedData.id, name: parsedData.name });
    }

    console.log('Обновленный waitingChats:', context.waitingChats);
    console.log('------------------------------------------------------');
}
