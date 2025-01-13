import { uuidv4 } from '@/utilities/uuid';
import { addAction } from '@/websocket/retry';
/**
 * Отправляет запрос на получение информации о пользователе.
 * @param {Function} context - Функция для отправки запроса.
 */
export function get_user_info(context){
  const request = {
    id: uuidv4(),
    name: 'get_user_info',
    body: {}
  };
  console.log(`Запрос ${request.name}:`, request);

  addAction(request);
  context.connection.send(JSON.stringify(request));
}

/**
 * Отправляет запрос на получение прочитанных чатов веб-пользователя.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} userId - Идентификатор пользователя.
 */
export function get_chats_by_user_Request(context) {
  const request = {
    id: uuidv4(),
    name: 'get_chats_by_user',
    body: {}
  };
  console.log(`Отправка запросика ${request.name}:`, request);
  addAction(request);

  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}


/**
 * Отправляет запрос на получение ожидающих чатов веб-пользователя.
 * @param {Function} context - Функция для отправки запроса.
 */
export function get_chats_in_which_user_is_not_member_Request(context) {
  const request = {
    id: uuidv4(),
    name: 'get_chats_in_which_user_is_not_member',
    body: { count: '50' }
  };
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}


/**
 * Отправляет запрос на получение сообщений чата по его идентификатору chatId,
 * он берется из запросов get_waiting_chats_Request и get_chats_by_user_Request.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} chat - чат.
 * @param {number} [count=50] - Количество сообщений для получения (по умолчанию 50).
 * @param {number} [offsetMessageId=-1] - Идентификатор сообщения для смещения (по умолчанию -1).
 * @param {boolean} [include_messege=false] - Включать ли сообщение с заданным индентификатором (по умолчанию false).
 * @param {string} [mode="up"] - В какую сторону выбирать сообщения (по умолчанию "up").
 */
export function get_messages_by_chat_Request(context, chat, count = 50, offsetMessageId = -1, include_messege=false, mode="up" ) {
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
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}



/**
 * Отправляет запрос на получение пользователей по идентификатору чата.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function get_users_by_chat_Request(context,chat_id) {
  const request = {
    id: uuidv4(),
    name: 'get_users_by_chat',
    body: { chat_id: chat_id }
  };
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
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


export let ignoreEventId = []
/**
 * Отправляет запрос на отправку сообщения в чат.
 * @param {Function} context - Функция для отправки запроса.
 * @param {Object} message - Сообщение, которое будет отправлено в чат.
 * @returns {Object} - Message, которое было отправлено.
 */
export function send_message_to_chat_Request(context, message) {
  let event_id = uuidv4();
  const request = {
    id: uuidv4(),
    name: 'send_message_to_chat',
    body: {
      message: message,
      event_id:event_id,
    }
  };
  ignoreEventId.push(event_id);
  console.log(`Отправка запросика ${request.name}:`, JSON.stringify(request));
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
  return message;
}

/**
 * Отправляет запрос на подключение к ожидающему чату по его идентификатору chatId.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 */
export function add_user_to_chat_Request(context, chat_id,user_id) {
  let event_id = uuidv4();
  const request = {
    id: uuidv4(),
    name: 'add_user_to_chat',
    body: { 
      chat_id: chat_id, 
      user_id:user_id, 
      event_id: event_id,
     }
  };
  ignoreEventId.push(event_id);
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}



export function get_chats_Request(context) {
  const request = {
    id: uuidv4(),
    name: 'get_chats',
    body: {}
  };
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}

/**
 * Отправляет запрос на отправку в архив чата.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function remove_to_archive_Request(context,chat_id) {
  const request = {
    id: uuidv4(),
    name: 'remove_to_archive',
    body: { 
      chat_id: chat_id,
      event_id: uuidv4(),
    }
  };
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}

/**
 * Отправляет запрос на установление последнего прочитанного сообщения в чате.
 * @param {Function} context - Функция для отправки запроса.
 * @param {string} chat_id - Идентификатор чата.
 * @param {string} last_read_message_id - Идентификатор чата.
 * @return {void} Эта функция ничего не возвращает.
 */
export function set_last_read_message_id_Request(context,chat_id, last_read_message_id) {
  const request = {
    id: uuidv4(),
    name: 'set_last_read_message_id',
    body: { 
      chat_id: chat_id,
      last_read_message_id: last_read_message_id,
      event_id: uuidv4(), 
    }
  };
  console.log(`Запрос ${request.name}:`, request);
  addAction(request);
  try{
    context.connection.send(JSON.stringify(request));
  }
  catch (e){
    console.log(e);
  }
}