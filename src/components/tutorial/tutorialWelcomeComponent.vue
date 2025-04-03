<template>
    <dib class="flex-list tutorial-welcome-component-container">
        <p class="tutorial-welcome-component-text-center">Добро пожаловать!</p>
        <Button label="Продолжить" @click="this.$tutorial.emit_event('next-button');" />
    </dib>
</template>

<script>
    import Button from 'primevue/button';

    export default {
      props: [],
      components:{
        Button
      },
      
      data(){
        return{
        }
      },
    };
  </script>

<style>
    @import '@/assets/Layout.css';
    @import 'primeicons/primeicons.css';

    .tutorial-welcome-component-text-center{
        margin: 1.25rem;
        text-align: center;
    }
    .tutorial-welcome-component-text{
        text-align: justify;
    }
    .tutorial-welcome-component-container{
        max-width: 20rem;
    }
</style>