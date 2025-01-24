<template>
  <div :class="{'flex-scale':button_waiting_chats, 'flex-list': true, 'overflow-h-hiddne': button_waiting_chats}" >
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListWaitingChats" >Ожидающие ответа чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_waiting_chats" step="20">
        <template v-for="chat in chats">
          <il 
            v-if="chat.is_waiting_answer && (!search_name ||chat.name.toLowerCase().includes(search_name))" 
            :key="chat.id" 
            :data-chat-id="chat.id" 
            :class="{ 'chat-item': true,  'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
            @click="$emit('select-user-chat', chat)"
            >
            <div class="avatar-base">
              <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
                <img :src="chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              </Avatar>
              <Avatar v-else :label="chat.name[0]" />
              <template v-if="chat.platform_id in platforms">
                <i v-if="platforms[chat.platform_id].platform_name==='telegram'" class="pi pi-telegram avatar-platform-icon" style="font-size: 0.75rem;"/>
                <svg
                  v-else-if="platforms[chat.platform_id].platform_name==='vk'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.75rem"
                  height="0.75rem"
                  viewBox="0 0 200 200"
                  class="avatar-platform-icon"
                >
                  <mask id="text-mask">
                    <!-- Белый квадрат (видимая область) -->
                    <rect x="0" y="0" width="200" height="200" fill="white"/>
                    <!-- Чёрный текст (вырезается из квадрата) -->
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="80" font-weight="bold">
                      VK
                    </text>
                  </mask>
                  <!-- Квадрат с применённой маской -->
                  <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-splitter-color);" mask="url(#text-mask)"/>
                </svg>
              </template>
            </div>
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_my_chats, 'flex-list': true, 'overflow-h-hiddne': button_my_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListMyChats" >Ваши чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_my_chats" step="20">
        <template v-for="chat in chats">
          <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && !chat.is_not_connected && (!search_name ||chat.name.toLowerCase().includes(search_name))"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
            <div class="avatar-base">
              <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
                <img :src="chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              </Avatar>
              <Avatar v-else :label="chat.name[0]"/>
              <p v-if="chat.count_unredeble_messgaes" class="avatar-vlaue">{{ chat.count_unredeble_messgaes }}</p>
              <template v-if="chat.platform_id in platforms">
                <i v-if="platforms[chat.platform_id].platform_name==='telegram'" class="pi pi-telegram avatar-platform-icon" style="font-size: 0.75rem;"/>
                <svg
                  v-else-if="platforms[chat.platform_id].platform_name==='vk'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.75rem"
                  height="0.75rem"
                  viewBox="0 0 200 200"
                  class="avatar-platform-icon"
                >
                  <mask id="text-mask">
                    <!-- Белый квадрат (видимая область) -->
                    <rect x="0" y="0" width="200" height="200" fill="white"/>
                    <!-- Чёрный текст (вырезается из квадрата) -->
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="80" font-weight="bold">
                      VK
                    </text>
                  </mask>
                  <!-- Квадрат с применённой маской -->
                  <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-splitter-color);" mask="url(#text-mask)"/>
                </svg>
              </template>
            </div>
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_other_chats, 'flex-list': true, 'overflow-h-hiddne': button_other_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_other_chats" step="20">
        <template v-for="chat in chats">
          <il 
          v-if="!chat.is_waiting_answer && !chat.is_archive && chat.is_not_connected && (!search_name ||chat.name.toLowerCase().includes(search_name))"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true,'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
            <div class="avatar-base">
              <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
                <img :src="chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              </Avatar>
              <Avatar v-else :label="chat.name[0]"/>
              <template v-if="chat.platform_id in platforms">
                <i v-if="platforms[chat.platform_id].platform_name==='telegram'" class="pi pi-telegram avatar-platform-icon" style="font-size: 0.75rem;"/>
                <svg
                  v-else-if="platforms[chat.platform_id].platform_name==='vk'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.75rem"
                  height="0.75rem"
                  viewBox="0 0 200 200"
                  class="avatar-platform-icon"
                >
                  <mask id="text-mask">
                    <!-- Белый квадрат (видимая область) -->
                    <rect x="0" y="0" width="200" height="200" fill="white"/>
                    <!-- Чёрный текст (вырезается из квадрата) -->
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="80" font-weight="bold">
                      VK
                    </text>
                  </mask>
                  <!-- Квадрат с применённой маской -->
                  <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-splitter-color);" mask="url(#text-mask)"/>
                </svg>
              </template>
            </div>
            <p class="chat-item-text">{{ chat.name }}</p>
          </il>
        </template>
      </ScrollPanel>
    </div>
  </div>

  <div :class="{'flex-scale':button_archive_chats, 'flex-list': true, 'overflow-h-hiddne': button_archive_chats}">
    <div class="chat-group-button-box">
      <Button class="chat-group-button" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_archive_chats" step="20">
        <template v-for="chat in chats">
          <il 
          v-if="chat.is_archive && (!search_name ||chat.name.toLowerCase().includes(search_name))"
          :key="chat.id" 
          :data-chat-id="chat.id" 
          :class="{ 'chat-item': true, 'flex-list-w': true, 'align-items-center':true, 'active': current_chat && chat.id == current_chat.id }" 
          @click="$emit('select-user-chat', chat)"
          >
            <div class="avatar-base">
              <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
                <img :src="chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              </Avatar>
              <Avatar v-else :label="chat.name[0]"/>
              <template v-if="chat.platform_id in platforms">
                <i v-if="platforms[chat.platform_id].platform_name==='telegram'" class="pi pi-telegram avatar-platform-icon" style="font-size: 0.75rem;"/>
                <svg
                  v-else-if="platforms[chat.platform_id].platform_name==='vk'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.75rem"
                  height="0.75rem"
                  viewBox="0 0 200 200"
                  class="avatar-platform-icon"
                >
                  <mask id="text-mask">
                    <!-- Белый квадрат (видимая область) -->
                    <rect x="0" y="0" width="200" height="200" fill="white"/>
                    <!-- Чёрный текст (вырезается из квадрата) -->
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="80" font-weight="bold">
                      VK
                    </text>
                  </mask>
                  <!-- Квадрат с применённой маской -->
                  <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-splitter-color);" mask="url(#text-mask)"/>
                </svg>
              </template>
            </div>
          <p class="chat-item-text">{{ chat.name }}</p>
        </il>
        </template>
      </ScrollPanel>
    </div>
  </div>
</template>

<script>
  import Avatar from 'primevue/avatar';
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';

  export default {
    props: ["chats","current_chat","search_name", "platforms"],
    components:{
      Avatar,
      Button,
      ScrollPanel,
    },
    methods:{
      ClicOnButtonInListWaitingChats() {
        this.button_waiting_chats = true;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListMyChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = true;
        this.button_other_chats = false;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListOtherChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = true;
        this.button_archive_chats = false;
      },
      ClicOnButtonInListArchiveChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = true;
      },
    },
    data() {
      return {
        button_waiting_chats: true,
        button_my_chats: false,
        button_other_chats: false,
        button_archive_chats: false,
      };
    },
  };
</script>