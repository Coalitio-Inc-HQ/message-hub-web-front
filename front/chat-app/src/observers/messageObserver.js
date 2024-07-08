// observers/messageObserver.js

import {
    handleNewMessage,
    handleGetWaitingChats,
    handleGetChatsByUser,
    handleGetMessagesByChat,
    handleNewWaitingChats,
    
  } from '@/messageHandlers/messageHandlers'


  export function setupMessageObserver(context) {
    context.$watch('data', (newData) => {
      if (newData) {
        const message = JSON.parse(newData);
        console.log('Получено какое-то сообщение:', message); 
        switch(message.name) {
          case 'get_waiting_chats':
            handleGetWaitingChats(context, message);
            break;
          case 'get_chats_by_user':
            handleGetChatsByUser(context, message);
            break;
          case 'get_messages_by_chat':
            handleGetMessagesByChat(context, message);
            break;
          case 'send_message_to_chat':
            console.log('Сообщение отправлено:', message);
            break;
          case 'new_waiting_chats':
            handleNewWaitingChats(context, message);
            break;
          case 'new_message':
            handleNewMessage(context, message);
            break;
          case 'new_user_in_chat':
            console.log('new_user_in_chat');
            console.log('------------------------------------------------------');
            console.log('Получили данные по new_user_in_chat:', message.body);
            console.log('В разработке');
            console.log('------------------------------------------------------');
            break;
          case 'status':
            console.log('status:', message.body);
            break;
          default:
            console.log('Необработанный тип сообщения:', message.name);
            break;
        }
      }
    });
  }



      // // Слушаем сообщения от сервера
    // this.$watch('data', (newData) => {
    //   if (newData) {
    //     const message = JSON.parse(newData);
    //     console.log('Получено какое-то сообщение:', message); 
    //     switch(message.name) {
          
    //     //Old requests
    //     case 'get_waiting_chats':{
    //       handleGetWaitingChats(this,message);
    //       break;
    //     }

    //     //Old requests
    //     case 'get_chats_by_user':{
    //       handleGetChatsByUser(this, message);
    //       break;      
    //     }

    //     //Old requests  
    //     case 'get_messages_by_chat':{
    //       handleGetMessagesByChat(this, message);
    //       break;
    //     }

    //     //Old send
    //     case 'send_message_to_chat':{
    //       console.log('Сообщение отправлено:', message);
    //       break;
    //     }

    //     //new requests
    //     case 'new_waiting_chats': {
    //       handleNewWaitingChats(this, message);
    //       break;
    //     }

    //     //new requests
    //     case 'new_message': {
    //       //trigger_front_new_message_in_chat_Listen(message);
    //       handleNewMessage(this, message);
    //       break;
    //     }

    //     //new
    //     case 'new_user_in_chat': {
    //       //trigger_front_new_user_in_chat_Listen(message);
    //       console.log('new_user_in_chat');
    //       console.log('------------------------------------------------------');
    //       console.log('Получили данные по new_user_in_chat:', message.body);
    //       console.log('В разработке');
    //       console.log('------------------------------------------------------');
    //       break;
    //     }
        
    //     case 'status': {
    //       console.log('status:',message.body);
    //       break;
    //     }
        
    //     default: {
    //       console.log('Необработанный тип сообщения:', message.name);
    //       break;
    //     }

    //     }
    //   }
    //   });
    