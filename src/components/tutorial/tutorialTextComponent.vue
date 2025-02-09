<template>
    <dib class="flex-list tutorial-text-component-container">
        <p class="tutorial-text-component-text">{{ text }}</p>
        <Button v-if="button" label="Продолжить" @click="this.$tutorial.emit_event('next-button');" />
    </dib>
</template>

<script>
    import Button from 'primevue/button';

    export default {
      props: ["text", "button"],
      components:{
        Button
      },
      
      data(){
        return{
        }
      },
    };
  </script>

<style scoped>
    @import '@/assets/Layout.css';
    @import 'primeicons/primeicons.css';

    .tutorial-text-component-text{
        text-align: justify;
        white-space: pre-wrap;
    }
    .tutorial-text-component-container{
        max-width: 20rem;
    }
</style>