export function fillTestData(component) {
    component.user_name = 'Test User';
    component.this_user_id = 33;
    component.user_chats = [
      { id: 15, name: 'Test Chat' },
    ];
    component.current_chat_id = 15;
    component.current_chat_messages = [
      { id: 1, chat_id: 15, sender_id: 33, sended_at: "2024-07-16T14:47:16", text: 'Проверка 23' },
      { id: 2, chat_id: 15, sender_id: 31, sended_at: '2024-07-16T14:47:28', text: 'Проверка 26' },
      { id: 3, chat_id: 15, sender_id: 31, sended_at: '2024-07-16T14:49:35', text: 'Проверка' },
      { id: 4, chat_id: 15, sender_id: 33, sended_at: '2024-07-16T14:49:46', text: 'Работает?' },
      { id: 5, chat_id: 15, sender_id: 32, sended_at: '2024-07-16T14:51:46', text: 'Точно' },
      { id: 6, chat_id: 15, sender_id: 33, sended_at: '2024-07-16T14:58:51', text: 'Да' },
      { id: 7, chat_id: 15, sender_id: 32, sended_at: '2024-07-16T15:01:13', text: 'Ал' },
      { id: 8, chat_id: 15, sender_id: 33, sended_at: '2024-07-16T15:01:15', text: 'Да' },
      { id: 9, chat_id: 15, sender_id: 32, sended_at: '2024-07-16T15:01:56', text: 'Isn\'t' },
      { id: 10, chat_id: 15, sender_id: 32, sended_at: '2024-07-16T15:02:12', text: '1zxccsadddddddddddddddddddddddddddddddasdddddddddsaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddcccccccccccccasdddddddddddddddddddddddddddddddddcccccccccccccccccccc23' },
    ];
    component.current_chat_users = [
      { id: 31, name: 'User 31' },
      { id: 32, name: 'User 32' },
      { id: 33, name: 'User 33' }
    ];
  }
  