// wsRequests.js




/**
 * Отправляет запрос на получение информации о пользователе.
 * @param {Function} send - Функция для отправки запроса.
 */
export function get_user_info(send){
  const request = {
    name: 'get_user_info',
    body: {}
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение списка чатов, связанных с пользователем.
 * @param {Function} send - Функция для отправки запроса.
 */
export function get_chats_by_user_Request(send) {
  const request = {
    name: 'get_chats_by_user',
    body: {}
  };
  console.log(`Отправка запросика ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение списка чатов, в которых пользователь не является участником.
 * Используется для определения чатов для присоединения.
 * @param {Function} send - Функция для отправки запроса.
 */
export function get_chats_in_which_user_is_not_member_Request(send) {
  const request = {
    name: 'get_chats_in_which_user_is_not_member',
    body: { count: '50' }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение сообщений чата по его идентификатору chatId,
 * @param {Function} send - Функция для отправки запроса.
 * @param {number} chatId - Идентификатор чата.
 * @param {number} [count=50] - Количество сообщений для получения (по умолчанию 50).
 * @param {number} [offsetMessageId=-1] - Идентификатор сообщения для смещения (по умолчанию -1).
 */
export function get_messages_by_chat_Request(send, chatId, count = 50, offsetMessageId = -1) {
  const request = {
    name: 'get_messages_by_chat',
    body: {
      chat_id: chatId,
      count: count,
      offset_message_id: offsetMessageId
    }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение пользователей по идентификатору чата.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата, для которого требуется получить список пользователей.
 */
export function get_users_by_chat_Request(send, chat_id) {
  const request = {
    name: 'get_users_by_chat',
    body: { chat_id: chat_id }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Создает сообщение для отправки в чат.
 * @param {Object} chat - Объект чата, который содержит текущее состояние итератора сообщений.
 * @param {string} user_id - Идентификатор пользователя, отправляющего сообщение.
 * @param {string} text - Текст сообщения.
 * @returns {Object} Возвращает объект сообщения.
 */
export function create_message(chat, user_id, text){
  if(chat.message_iterator){
    chat.message_iterator = chat.message_iterator=+1;
  }else{
    chat.message_iterator = 0;
  }
  return {
    id: -1,
    chat_id: chat.id,
    sender_id: user_id,
    sended_at: new Date().toISOString(),
    text: text,
    front_message_id: chat.message_iterator
  }
}


/**
 * Отправляет запрос на отправку сообщения в чат.
 * @param {Function} send - Функция для отправки запроса.
 * @param {Object} message - Сообщение, которое будет отправлено в чат.
 * @returns {Object}  Возвращает объект сообщения, который был отправлен.
 */
export function send_message_to_chat_Request(send, message) {
  const request = {
    name: 'send_message_to_chat',
    body: {
      message: message
    }
  };
  console.log(`Отправка запросика ${request.name}:`, JSON.stringify(request));
  send(JSON.stringify(request));
  return message;
}


/**
 * Отправляет запрос на добавление пользователя в чат. 
 * @param {Function} send - Функция для отправки запроса.
 * @param {number} chat_id - Идентификатор чата.
 * @param {number} user_id - Идентификатор пользователя, которого нужно добавить в чат.
 */
export function add_user_to_chat_Request(send, chat_id, user_id) {
  const request = {
    name: 'add_user_to_chat',
    body: { chat_id: chat_id, user_id: user_id }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}
