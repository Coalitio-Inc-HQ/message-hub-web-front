<template>
  <il 
  :class="{ 'chat-item': true, 'flex-list-w': true, 'align-items-center':true, 'active': is_iselected}" 
  @click="$emit('select-chat', chat)"
  >
    <div class="avatar-base">
      <Avatar v-if="chat.icon_url" :image="chat.icon_url" shape="square" style="border-radius: 8px;">
        <img :src="chat.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
      </Avatar>
      <Avatar v-else :label="chat.name[0]"/>

      <template v-if="chat.platform_id in platforms.platforms">
        <i v-if="platforms.platforms[chat.platform_id].platform_name==='telegram'" class="pi pi-telegram avatar-platform-icon" style="font-size: 0.75rem;"/>

        <svg
        v-else-if="platforms.platforms[chat.platform_id].platform_name==='vk'"
        xmlns="http://www.w3.org/2000/svg"
        width="0.75rem"
        height="0.75rem"
        viewBox="0 0 200 200"
        class="avatar-platform-icon"
        >
          <mask id="text-mask">
              <rect x="0" y="0" width="200" height="200" fill="white"/>
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="80" font-weight="bold">
              VK
              </text>
          </mask>
          <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-splitter-color);" mask="url(#text-mask)"/>
        </svg>
      </template>
    </div>
    <p class="chat-item-text">{{ chat.name }}</p>
  </il>
</template>
  
  <script>
    import Avatar from 'primevue/avatar';
  
    export default {
      props: ["chat","is_iselected", "platforms"],
      components:{
        Avatar,
      },
      methods:{
      },
      data() {
        return {
        };
      },
    };
  </script>