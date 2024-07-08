
export function trigger_front_new_waiting_chat_Listen(DataWebSocket) {
   
    if(DataWebSocket.name=="new_waiting_chats"){
    console.log(`Получен новый чат по запросу ${DataWebSocket.name}: ${JSON.stringify(DataWebSocket.body.chats)}`);

   }
   
}

export function trigger_front_new_message_in_chat_Listen(DataWebSocket) {
    
    if (DataWebSocket.name === 'new_message') {
        console.log('Полученно сообщение для нового чата:', DataWebSocket.body.message);
        
      }
    
}

export function trigger_front_new_user_in_chat_Listen(DataWebSocket) {
    
    if (DataWebSocket.name === 'new_user_in_chat') {
        console.log('Новый пользователь:', DataWebSocket.body.user_id, 'в чате', DataWebSocket.body.chat);
      }

}