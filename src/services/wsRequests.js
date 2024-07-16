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
 * Отправляет запрос на получение прочитанных чатов веб-пользователя.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} userId - Идентификатор пользователя.
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
 * Отправляет запрос на получение ожидающих чатов веб-пользователя.
 * @param {Function} send - Функция для отправки запроса.
 */
export function get_waiting_chats_Request(send) {
  const request = {
    name: 'get_waiting_chats',
    body: { count: '50' }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение сообщений из ожидающего чата по его идентификатору chatId,
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chatId - Идентификатор чата.
 * @param {number} [count=50] - Количество сообщений для получения (по умолчанию 50).
 * @param {number} [offsetMessageId=-1] - Идентификатор сообщения для смещения (по умолчанию -1).
 */
export function get_messages_by_waiting_chat_Request(send, chatId, count = 50, offsetMessageId = -1) {
  const request = {
    name: 'get_messages_by_waiting_chat',
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
 * Отправляет запрос на получение сообщений чата по его идентификатору chatId,
 * он берется из запросов get_waiting_chats_Request и get_chats_by_user_Request.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chatId - Идентификатор чата.
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
 * @param {string} chat_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function get_users_by_chat_Request(send,chat_id) {
  const request = {
    name: 'get_users_by_chat',
    body: { chat_id: chat_id }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Создает сообщение для отправки в чат.
 * @param {Object} context - Контекст, в котором происходит отправка сообщения.
 * @param {number} user_id - Идентификатор пользователя, который отправляет сообщение.
 * @param {number} chat_id - Идентификатор чата, в который отправляется сообщение.
 * @param {string} text - Текст сообщения, которое будет отправлено.
 * @param {number} front_message_id - Идентификатор сообщения, которое было отправлено с фронтенда.
 * @returns {Object} - Созданное сообщение, которое будет отправлено.
 */
export function create_message(context,user_id, chat_id, text, front_message_id){
  context.message_iterator=context.message_iterator+1;
  return {
    id: -1,
    chat_id: chat_id,
    sender_id: user_id,
    sended_at: new Date().toISOString(),
    text: text,
    front_message_id: front_message_id
  }
}



/**
 * Отправляет запрос на отправку сообщения в чат.
 * @param {Function} send - Функция для отправки запроса.
 * @param {Object} message - Сообщение, которое будет отправлено в чат.
 * @returns {Object} - Message, которое было отправлено.
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
 * Отправляет запрос на подключение к ожидающему чату по его идентификатору chatId.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 */
export function connect_to_waiting_chat_Request(send, chat_id) {
  const request = {
    name: 'connect_to_waiting_chat',
    body: { chat_id: chat_id }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}

