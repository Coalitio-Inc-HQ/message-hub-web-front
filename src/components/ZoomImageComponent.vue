<template>
    <div :class="this.$props.container_class" class="relative">
      <template v-if="!this.loaded_image || this.error_loading">
          <div class="plaseholder-container">
            <div class="plaseholder-spinner">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"/>
            </div>
          </div>
      </template>
      <img ref="zoomImage" :src="this.$props.src" @load="this.loaded_image=true" @error="this.error_loading=true;" :class="this.$props.class" class="transform absolute user-drag-none" :style="{transform: [`scale(${this.$props.image_scale})`]}" loading="lazy" 
      @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
    </div>
</template>
  
<script>
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let dist_g = null;

    export default {
      components:{

      },

      props: [
        "src",
        "class",
        "container_class",
        "image_scale"
      ],
      emits:[
        "update:image_scale"
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
        mouseDown(e){
            isDragging = true;
            startX = e.clientX - this.$refs.zoomImage.offsetLeft;
            startY = e.clientY - this.$refs.zoomImage.offsetTop;
        },

        mouseMove(e){
            if (isDragging) {
                const moveX = e.clientX - startX;
                const moveY = e.clientY - startY;
                this.$refs.zoomImage.style.left = moveX + 'px';
                this.$refs.zoomImage.style.top = moveY + 'px';
            }
        },

        mouseUp(e){
            isDragging = false;
        },



        // Поддержка перемещения (тачскрин)
        touchStart(e){
            e.preventDefault();
            isDragging = true;
            startX = e.touches[0].clientX - this.$refs.zoomImage.offsetLeft;
            startY = e.touches[0].clientY - this.$refs.zoomImage.offsetTop;
        },

        touchMove(e){
            if (isDragging) {
                e.preventDefault();
                const moveX = e.touches[0].clientX - startX;
                const moveY = e.touches[0].clientY - startY;
                this.$refs.zoomImage.style.left = moveX + 'px';
                this.$refs.zoomImage.style.top = moveY + 'px';

                if (e.touches.length === 2) {
                    const dist = this.getDistance(e.touches[0], e.touches[1]);
                    if (!dist_g) dist_g = dist;
                    const scale = dist / dist_g; // Исходное значение зума
                    this.$refs.zoomImage.style.transform = `scale(${scale})`;
                }
            }
        },

        touchEnd(){
            isDragging = false;
            dist_g=null;
        },

        // Функция для вычисления расстояния между двумя пальцами (для зума)
        getDistance(touch1, touch2){
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        },

      },

    };
  </script>
  
  <style>
    @import '@/assets/Image.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
  </style>