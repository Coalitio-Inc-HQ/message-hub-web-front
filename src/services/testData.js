// testData.js
export function fillTestData(component) {
  component.user_name = 'Test User';
  component.this_user_id = 33;
  component.chats = [
      {
          id: 1,
          name: 'Test Chat 1',
          messages: [
              { id: 1, chat_id: 1, sender_id: 33, sended_at: "2024-07-16T14:47:16", text: 'Привет!' },
              { id: 2, chat_id: 1, sender_id: 31, sended_at: '2024-07-16T14:47:28', text: 'Привет, как дела?' },
              { id: 3, chat_id: 1, sender_id: 33, sended_at: '2024-07-16T14:49:35', text: 'Все хорошо, спасибо!' }
          ],
          users: [
              { id: 31, name: 'User 31' },
              { id: 32, name: 'User 32' },
              { id: 33, name: 'User 33' }
          ],
          is_not_connected: false,
          waiting_messages: [],
          waiting_connaction: false
      },
      {
          id: 2,
          name: 'Test Chat 2',
          messages: [
              { id: 4, chat_id: 2, sender_id: 33, sended_at: "2024-07-16T15:47:16", text: 'Как тебе новый проект?' },
              { id: 5, chat_id: 2, sender_id: 32, sended_at: '2024-07-16T15:47:28', text: 'Очень нравится!' }
          ],
          users: [
              { id: 31, name: 'User 31' },
              { id: 32, name: 'User 32' },
              { id: 33, name: 'User 33' }
          ],
          is_not_connected: true,
          waiting_messages: [],
          waiting_connaction: false
      }
  ];
  component.current_chat = component.chats[0]; 
}
