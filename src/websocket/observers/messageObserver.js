import router from "@/router";
import handlers from "@/websocket/Handlers/messageHandlers.js";
import {
  get_chats_by_user_Request, 
  get_chats_in_which_user_is_not_member_Request,
  get_user_info 
} from "@/services/wsRequests";

export function setupMessageObserver(context, ws) {
  console.log(ws);

  // Обработчик события закрытия соединения
  ws.onclose = (event) => {
    if (event.code === 1008) {
      router.push('/login');
    }
    console.log("WebSocket connection closed:", event);
  };

  // Отправка начальных запросов при подключении
  ws.onopen = () => {
    console.log("WebSocket connection opened");
    get_user_info(ws.send.bind(ws));
    get_chats_by_user_Request(ws.send.bind(ws));
    get_chats_in_which_user_is_not_member_Request(ws.send.bind(ws));
  };

  ws.onmessage = async (event) => {
    console.log("Мы в главном обработчике handlers");
    console.log(event);
    let newData = event.data;
    if (newData) {
      const dict_message = JSON.parse(newData);

      // Проверка типа сообщения и вызов соответствующего хендлера
      const messageType = dict_message.name;
      if (handlers[messageType]) {
        try {
          await handlers[messageType](context, dict_message);
        } catch (error) {
          console.error(`При обработке сообщения типа ${messageType} произошла ошибка:`, error);
          console.error(`Error name: ${error.name}`);
          console.error(`Error message: ${error.message}`);
          console.error(`Error stack: ${error.stack}`);
        }
      } else {
        console.warn(`Не найден обработчик для сообщения типа: ${messageType}`);
      }
    }
  }; 
}