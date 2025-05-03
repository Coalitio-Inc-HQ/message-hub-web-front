<template>
    <div class="flex-list-w overflow-x-auto w-scrollbar">
        <Button 
            v-for="file in files"
            class="miniature-button flex-list !p-0"
            :key="file.id"
            @click="openMiniature(file.id)"
        >
            <template v-if="file.type==='image'">
                <ImageComponent class="miniature-image-file" container_class="miniature-image-container-file" use_background_image="false" :src="file.url"/>

                <i class="pi pi-eye miniature-acthion-button"/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.delete_call(); e.preventDefault();}"/>
            </template>
            <template v-else-if="file.type==='video'" >
                <i v-if="file.miniature.loging" class="pi pi-spin pi-spinner"/>
                <ImageComponent v-else class="miniature-image-file" container_class="miniature-image-container-file"  use_background_image="false" :src="file.miniature.url"/>

                <i class="pi pi-caret-right miniature-acthion-button"/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.delete_call(); e.preventDefault();}"/>
            </template>

            <template v-else-if="file.type==='file'">
                <i class="pi pi-file" style="font-size: 1.5rem"/>
                <div class="miniature-file-text">{{ file.name }}</div>

                <i class="pi pi-download miniature-acthion-button invisible "/>
                <i class="pi pi-times miniature-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null); file.delete_call(); e.preventDefault();}"/>
            </template>
            <ProgressBar v-if="!file.uploaded || 'miniature' in file && !file.miniature.uploaded" :value="file.progress*100" class="miniature-acthion-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
        </Button>

        <Drawer v-if="this.openIndex!=null" v-model:visible="drawer_visible"  position="full">
            <template #header>
                <div class="flex-list-w drawer-heder-container items-center">
                    <p class="text-2xl drawer-heder-text line-clamp-1 break-all">{{this.files[this.openIndex].name}}</p>
                    <div class="flex-scale"></div>
                    <Button v-if="this.files[this.openIndex].type==='image'" icon="pi pi-search-plus" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" @click="this.image_scale*=2"/>
                    <Button v-if="this.files[this.openIndex].type==='image'" icon="pi pi-search-minus" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" @click="this.image_scale/=2"/>
                    <Button icon="pi pi-trash" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" @click="(e)=>{this.files[this.openIndex].delete_call(); openMiniature(null); e.preventDefault();}"/>
                </div>
            </template>
            <div class="drawer-content-container" @mousemove="showSlideButtons">
                <!-- <ImageComponent v-if="this.files[this.openIndex].type==='image'" class="drawer-content-container-image" container_class="drawer-content-container-image-comp" :src="this.files[this.openIndex].url" alt=" "/> -->
                <ZoomImageComponent v-if="this.files[this.openIndex].type==='image'" :image_scale="this.image_scale" class="full-image" container_class="full-image-container" :src="this.files[this.openIndex].url"/>

                <video v-else-if="this.files[this.openIndex].type==='video'" class="drawer-content-container-video" :src="this.files[this.openIndex].url" controls/>
                <template v-else-if="this.files[this.openIndex].type==='file'">
                    <Button class="drawer-content-container-file-container flex-list" @click="this.downloadFile(this.files[this.openIndex].url,this.files[this.openIndex].name)">
                        <i class="pi pi-file drawer-content-container-file-container-icon" style="font-size: 1.5rem"/>
                        <div class="drawer-content-container-file-text">{{ this.files[this.openIndex].name }}</div>
                    </Button>
                </template>
                
                <i v-if="this.visible_slide_buttons && this.openIndex>0" class="pi pi-chevron-left drawer-content-container-slide-left" @click="this.openIndex=this.openIndex-1"/>
                <i v-if="this.visible_slide_buttons && this.openIndex<this.files.length-1" class="pi pi-chevron-right drawer-content-container-slide-right" @click="this.openIndex=this.openIndex+1"/>
            </div>

        </Drawer>
    </div>
</template>
<script>
    import ImageComponent from '../ImageComponent.vue';
    import Drawer from 'primevue/drawer';
    import Button from 'primevue/button';
    import ProgressBar from 'primevue/progressbar';
    import ZoomImageComponent from '../ZoomImageComponent.vue';

    export default {
        props: ["files"],

        components:{
            ImageComponent,
            Drawer,
            Button,
            ProgressBar,
            ZoomImageComponent,
        },

        methods:{
            openMiniature(id){
                if (id){
                    this.openIndex = this.files.findIndex(item => item.id === id);
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
                image_scale: 1,
            }
        },           
    }
</script>

<style>
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/UploadedFileList.css';
</style>