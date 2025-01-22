<template>
    <Button class="preview-button" @click="() =>{if (is_min_window){this.openFullscreen();} else{visible = true;}}">
        <img class="image" loading="lazy" :src="this.preview" alt=" "/>
        <div class="icon">
            <i class="pi pi-caret-right"></i>
        </div>
    </Button>

    <Dialog v-model:visible="visible" :header="name">
        <video class="video" ref="video" :src="url" controls></video>
    </Dialog>

</template>

<script>
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    export default {
        props: ["url", "name", "is_min_window"],
        components: {
            Dialog,
            Button,
        },
        data(){
            return{
                preview:null,
                visible: false,
            }
        },
        methods:{
            generatePreview() {
                const videoElement = document.createElement('video');
                videoElement.width = 320;
                videoElement.height = 240;
                videoElement.style.display = 'none'; // Скрываем видео на странице
                // Устанавливаем источник видео
                videoElement.src = this.url;
                videoElement.load();
                videoElement.play();
                // Получаем доступ к канвасу
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Когда видео загружено, делаем превью
                videoElement.onloadeddata = () => {
                    // Устанавливаем время на 2 секунды, чтобы взять кадр с этого времени
                    videoElement.currentTime = 2;
                    // После того как видео перемотается, рисуем кадр
                    videoElement.onseeked = () => {
                        // Рисуем текущий кадр на канвасе
                        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        videoElement.pause(); // Останавливаем воспроизведение видео
                        this.preview =  canvas.toDataURL('image/png');
                        // Удаляем элемент <video> после того, как превью сделано
                        videoElement.remove();
                        canvas.remove();
                    };
                };
            },

            openFullscreen() {
                const videoElement = document.createElement('video');
                videoElement.src = this.url;
                videoElement.load();

                document.body.appendChild(videoElement);

                // Проверяем поддержку API полноэкранного режима в браузере
                if (videoElement.requestFullscreen) {
                    videoElement.requestFullscreen();
                } else if (videoElement.mozRequestFullScreen) { // Firefox
                    videoElement.mozRequestFullScreen();
                } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
                    videoElement.webkitRequestFullscreen();
                } else if (videoElement.msRequestFullscreen) { // IE/Edge
                    videoElement.msRequestFullscreen();
                } else {
                    alert("Ваш браузер не поддерживает полноэкранный режим.");
                }

                videoElement.onfullscreenchange = (e) => {
                    console.log(e);
                    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                        console.log("fullscreen")
                    } else {
                        document.body.removeChild(videoElement);
                    }
                };
                videoElement.play();
            }
        },

        mounted(){
            this.generatePreview();
        },
    }
</script>

<style scoped>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/VideoItem.css';
</style>