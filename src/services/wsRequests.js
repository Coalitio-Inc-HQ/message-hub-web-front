// wsRequests.js
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

/**
 * Отправляет запрос на получение информации о пользователе.
 * @param {Function} send - Функция для отправки запроса.
 */
export function get_user_info(send){
  const request = {
    id: uuidv4(),
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
    id: uuidv4(),
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
export function get_chats_in_which_user_is_not_member_Request(send) {
  const request = {
    id: uuidv4(),
    name: 'get_chats_in_which_user_is_not_member',
    body: { count: '50' }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}


/**
 * Отправляет запрос на получение сообщений чата по его идентификатору chatId,
 * он берется из запросов get_waiting_chats_Request и get_chats_by_user_Request.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chat - чат.
 * @param {number} [count=50] - Количество сообщений для получения (по умолчанию 50).
 * @param {number} [offsetMessageId=-1] - Идентификатор сообщения для смещения (по умолчанию -1).
 */
export function get_messages_by_chat_Request(send, chat, count = 50, offsetMessageId = -1, include_messege=false, mode="up" ) {
  if (!chat.await_messages){
    chat.await_messages = true;
    const request = {
      id: uuidv4(),
      name: 'get_messages_by_chat',
      body: {
        chat_id: chat.id,
        count: count,
        offset_message_id: offsetMessageId,
        include_messege: include_messege,
        mode: mode,
      }
    };
    console.log(`Запрос ${request.name}:`, request);
    send(JSON.stringify(request));
  }
}



/**
 * Отправляет запрос на получение пользователей по идентификатору чата.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function get_users_by_chat_Request(send,chat_id) {
  const request = {
    id: uuidv4(),
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
export function create_message(chat, user_id, text, files, front_message_id = null){
  if (!front_message_id){
    if(chat.message_iterator){
      chat.message_iterator=chat.message_iterator+=1;
    }else{
      chat.message_iterator=1;
    }
  }

  let attachments = {
    images: [],
    videos: [],
    files: [],
  }

  files.forEach(element => {
    if (element.value.file.type.startsWith('image/')){
      attachments.images.push({
        url: element.value.url,
        name: element.value.file.name,
      });
    } else if (element.value.file.type.startsWith('video/')){
      attachments.videos.push({
        url: element.value.url,
        name: element.value.file.name,
      });
    } else {
      attachments.files.push({
        url: element.value.url,
        name: element.value.file.name,
      });
    }
  });

  return {
    id: -1,
    chat_id: chat.id,
    sender_id: user_id,
    sended_at: new Date().toISOString(),
    text: text,
    front_message_id: front_message_id? front_message_id: chat.message_iterator,
    attachments: attachments,
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
    id: uuidv4(),
    name: 'send_message_to_chat',
    body: {
      message: message,
      event_id: uuidv4(),
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
export function add_user_to_chat_Request(send, chat_id,user_id) {
  const request = {
    id: uuidv4(),
    name: 'add_user_to_chat',
    body: { 
      chat_id: chat_id, 
      user_id:user_id, 
      event_id: uuidv4(),
     }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}



export function get_chats_Request(send) {
  const request = {
    id: uuidv4(),
    name: 'get_chats',
    body: {}
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}

/**
 * Отправляет запрос на отправку в архив чата.
 * @param {Function} send - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function remove_to_archive_Request(send,chat_id) {
  const request = {
    id: uuidv4(),
    name: 'remove_to_archive',
    body: { 
      chat_id: chat_id,
      event_id: uuidv4(),
    }
  };
  console.log(`Запрос ${request.name}:`, request);
  send(JSON.stringify(request));
}
