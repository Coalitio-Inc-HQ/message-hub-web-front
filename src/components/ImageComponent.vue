<template>
    <div :class="this.$props.container_class" :style="this.$props.use_background_image? `background: url('${this.$props.src}');`: ''">
      <template v-if="!this.loaded_image || this.error_loading">
          <div class="plaseholder-container">
            <div class="plaseholder-spinner">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"/>
            </div>
          </div>
      </template>
      <img :src="this.$props.src" @load="this.loaded_image=true" @error="this.error_loading=true;" :class="this.$props.class" class="blure" loading="lazy" >
    </div>
</template>
  
<script>
    export default {
      components:{

      },

      props: [
        "src",
        "class",
        "container_class",
        "use_background_image"
      ],

      watch: { 
        'src': {
            handler() {
                this.loaded_image = false;
                this.error_loading = false;
            },
            deep: true,
            immediate: true,
        },
      },

  
      data(){
        return{
          loaded_image: false,
          error_loading: false,
        }
      },
  
      methods: {
        
      },

    };
  </script>
  
  <style>
    @import '@/assets/Image.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
  </style>