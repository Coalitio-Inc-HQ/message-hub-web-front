<template>
    <div class="flex-list-w overflow-x-auto w-scrollbar">
        <Button 
            v-for="file in files"
            class="miniature-button flex-list"
            :key="file.value.id"
            @click="openMiniature(file.value.id)"
        >
            <template v-if="file.value.type==='image'">
                <img class="miniature-image" :src="file.value.temp_url" alt="Ошибка загрузки изображения."/>

                <i class="pi pi-eye miniature-acthion-button"/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.value.delete_call(); e.preventDefault();}"/>
            </template>
            <template v-else-if="file.value.type==='video'" >
                <i v-if="file.value.miniature.loging" class="pi pi-spin pi-spinner"/>
                <img v-else class="miniature-image" :src="file.value.miniature.url" alt="Ошибка загрузки видео."/>

                <i class="pi pi-caret-right miniature-acthion-button"/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.value.delete_call(); e.preventDefault();}"/>
            </template>

            <template v-else-if="file.value.type==='file'">
                <i class="pi pi-file" style="font-size: 1.5rem"/>
                <div class="miniature-file-text">{{ file.value.name }}</div>

                <i class="pi pi-download miniature-acthion-button"/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.value.delete_call(); e.preventDefault();}"/>
            </template>
            <ProgressBar v-if="!file.value.uploaded" :value="file.value.progress*100" class="miniature-acthion-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
        </Button>

        <Drawer v-if="this.openIndex!=null" v-model:visible="drawer_visible"  position="full">
            <template #header>
                <div class="flex-list-w drawer-heder-container">
                    <p class="drawer-heder-container-text">{{this.files[this.openIndex].value.name}}</p>
                    <div class="flex-scale"></div>
                    <Button icon="pi pi-trash" variant="outlined" class="p-button-rounded p-button-text p-button-secondary" @click="(e)=>{this.files[this.openIndex].value.delete_call(); openMiniature(null); e.preventDefault();}"/>
                </div>
            </template>
            <div class="drawer-content-container" @mousemove="showSlideButtons">
                <img v-if="this.files[this.openIndex].value.type==='image'" class="drawer-content-container-image" :src="this.files[this.openIndex].value.temp_url" alt="Ошибка загрузки изображения."/>
                <video v-else-if="this.files[this.openIndex].value.type==='video'" class="drawer-content-container-video" :src="this.files[this.openIndex].value.temp_url" controls/>
                <template v-else-if="this.files[this.openIndex].value.type==='file'">
                    <Button class="drawer-content-container-file-container flex-list" @click="this.downloadFile(this.files[this.openIndex].value.temp_url,this.files[this.openIndex].value.name)">
                        <i class="pi pi-file drawer-content-container-file-container-icon" style="font-size: 1.5rem"/>
                        <div class="drawer-content-container-file-text">{{ this.files[this.openIndex].value.name }}</div>
                    </Button>
                </template>
                
                <i v-if="this.visible_slide_buttons && this.openIndex>0" class="pi pi-chevron-left drawer-content-container-slide-left" @click="this.openIndex=this.openIndex-1"/>
                <i v-if="this.visible_slide_buttons && this.openIndex<this.files.length-1" class="pi pi-chevron-right drawer-content-container-slide-right" @click="this.openIndex=this.openIndex+1"/>
            </div>

        </Drawer>
    </div>
</template>
<script>
    import Drawer from 'primevue/drawer';
    import Button from 'primevue/button';
    import ProgressBar from 'primevue/progressbar';

    export default {
        props: ["files"],

        components:{
            Drawer,
            Button,
            ProgressBar,
        },

        methods:{
            openMiniature(id){
                if (id){
                    this.openIndex = this.files.findIndex(item => item.value.id === id);
                    if (this.openIndex!=-1){
                        this.drawer_visible=true;
                    } else{
                        this.openIndex = null;
                        this.drawer_visible=false;                            
                    }
                }else{
                    this.openIndex = null;
                    this.drawer_visible=false;                    
                }
            },

            showSlideButtons() {
                this.visible_slide_buttons = true;

                // Сбрасываем старый таймер скрытия
                if(this.hideTimeout) clearTimeout(this.hideTimeout);

                // Устанавливаем новый таймер скрытия
                this.hideTimeout = setTimeout(() => {
                    this.visible_slide_buttons = false;
                }, 1000); // Кнопки исчезнут через 1 секунду
            },

            downloadFile(url, name){
                var link = document.createElement("a");
                link.download = name;
                link.href = url;
                link.click();
            },
        },

        data(){
            return {
                openIndex: null,
                drawer_visible: false,
                visible_slide_buttons: false,
                hideTimeout: null,
            }
        },           
    }
</script>

<style scoped>
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/UploadedFileList.css';
</style>