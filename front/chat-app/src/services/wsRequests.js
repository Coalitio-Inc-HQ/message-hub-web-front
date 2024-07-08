// wsRequests.js


/**
 * Отправляет запрос на получение прочитанных чатов веб-пользователя.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} userId - Идентификатор пользователя.
 */
export function get_chats_by_user_Request(send, userId) {
    const request = {
      name: "get_chats_by_user",
      body: { user_id: userId }
    };
    console.log(`Отправка запросика ${request.name}:`, request);  
    send(JSON.stringify(request));
  }


/**
 * Отправляет запрос на получение ожидающих чатов веб-пользователя.
 * @param {Function} send - Функция для отправки запроса.
 */
  export function get_waiting_chats_Request(send) {
    const request = {
      name: 'get_waiting_chats',
      body: { count: '50' }
    };
    console.log(`Отправка запросика ${request.name}:`, request);  
    send(JSON.stringify(request));
  }
  

/**
 * Отправляет запрос на получение сообщений чата по его идентификатору chatId,
 * он берется из запросов get_waiting_chats_Request и get_chats_by_user_Request
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chatId - Идентификатор чата.
 * @param {number} [count=50] - Количество сообщений для получения (по умолчанию 50).
 * @param {number} [offsetMessageId=-1] - Идентификатор сообщения для смещения (по умолчанию -1).
 */
  export function get_messages_by_chat_Request(send, chatId, count = 50, offsetMessageId = -1) {
    const request = { 
      name: "get_messages_by_chat", 
      body: { 
        chat_id: chatId, 
        count: count, 
        offset_message_id: offsetMessageId 
      }
    };
    console.log(`Отправка запросика ${request.name}:`, request);  
    send(JSON.stringify(request));
  }



  export function send_message_to_chat(send, userId, chatId, message) {
    const request = {
      name: "send_message_to_chat",
      body: {
        
        user_id: userId,
        chat_id: chatId,
        message: {
          id: message.id,
          chat_id: chatId,
          sender_id: userId,
          sended_at: message.sended_at,
          text: message.text
        }
      }
    };
    console.log(`Отправка запросика ${request.name}:`, JSON.stringify(request));  
    send(JSON.stringify(request));
  }
  