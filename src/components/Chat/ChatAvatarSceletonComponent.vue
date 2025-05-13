<template>
    <li 
    class="chat-item flex-list-w align-items-center" 
    >
      <div class="avatar-base">
        <Skeleton size="2rem" class="mr-2"/>
      </div>
      <Skeleton class="mb-2 chat-item-text"/>
    </li>
  </template>
    
<script>
    import Skeleton from 'primevue/skeleton';

    export default {
    components:{
        Skeleton,
    },
    methods:{
    },
    data() {
        return {
        };
    },
    };
</script>