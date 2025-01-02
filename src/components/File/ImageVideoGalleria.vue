<template>
    <div class="galleria">
        <button 
            v-for="miniature in this.miniatures"
            class="miniature-item"
            :key="miniature.id"
            @click="openMiniature(miniature.id)"
        >
            <img class="miniature-image" :src="miniature.url" :alt="miniature.type==='image'?'Ошибка загрузки изображения.':'Ошибка загрузки видео.'"/>
            <div class="icon-open-container">
                <i v-if="miniature.type==='video'" class="pi pi-caret-right"/>
                <i v-if="miniature.type==='image'" class="pi pi-eye"/>
            </div>
        </button>

        <Drawer v-if="this.openIndex!=null" v-model:visible="drawer_visible"  position="full">
            <template #header>
                <div class="flex-list-w drawer-heder-container">
                    <p class="drawer-heder-text">{{this.miniatures[this.openIndex].name}}</p>
                    <div class="flex-scale"></div>
                    <Button v-if="is_temp_messge" icon="pi pi-trash" variant="outlined" class="drawer-delete-button p-button-rounded p-button-text p-button-secondary" @click="this.miniatures[this.openIndex].delete"/>
                </div>
            </template>
            <div class="full-container icon-slide-container">
                <img v-if="this.miniatures[this.openIndex].type==='image'" class="full-image" :src="this.miniatures[this.openIndex].url" alt="Ошибка загрузки изображения."/>
                <video v-if="this.miniatures[this.openIndex].type==='video'" class="full-video" :src="this.miniatures[this.openIndex].video_url" controls/>
            
                <i v-if="this.openIndex>0" class="pi pi-chevron-left icon-slide-left" @click="this.openIndex=this.openIndex-1"/>
                <i v-if="this.openIndex<this.miniatures.length-1" class="pi pi-chevron-right icon-slide-right" @click="this.openIndex=this.openIndex+1"/>
            </div>

        </Drawer>
    </div>
</template>
<script>
    import { v4 as uuidv4 } from 'uuid';

    import {generateVideoPreview,
    } from '@/utilities/VideoMiniature';

    import Drawer from 'primevue/drawer';
    import Button from 'primevue/button';

    export default {
        props: ["attachments", "is_temp_messge", "is_min_window"],

        components:{
            Drawer,
            Button,
        },

        methods:{
            generateVideoPreview,

            openMiniature(id){
                this.openIndex = this.miniatures.findIndex(item => item.id === id);
                this.drawer_visible=true;
            },
        },

        data(){
            return {
                miniatures: [],
                openIndex: null,
                drawer_visible: false,
            }
        },

        async mounted(){
            let arr = [];

            if (this.attachments.images && this.attachments.images.length>0){
                this.attachments.images.forEach((element)=>{
                    if (this.is_temp_messge){
                        arr.push({
                            name: element.value.file.name,
                            url: element.value.temp_url,
                            delete: element.value.delete,
                            type: "image",
                            id: uuidv4(),
                        });
                    } else{
                        arr.push({
                            name: element.name,
                            url: element.url,
                            delete: null,
                            type: "image",
                            id: uuidv4(),
                        });     
                    }
                })
            }

            if (this.attachments.videos && this.attachments.videos.length>0){
                for (const element of this.attachments.videos) {
                    try{
                        if (this.is_temp_messge){
                            arr.push({
                                name: element.value.file.name,
                                url: await this.generateVideoPreview(320, 240, element.value.temp_url),
                                video_url: element.value.temp_url,
                                delete: element.value.delete,
                                type: "video",
                                id: uuidv4(),
                            });  
                        }
                        else{
                            arr.push({
                                name: element.name,
                                url: await this.generateVideoPreview(320, 240, element.url),
                                video_url: element.url,
                                delete: null,
                                type: "video",
                                id: uuidv4(),
                            });  
                        }
                    }
                    catch (e){
                        console.log(e);
                        arr.push({
                            name: element.name,
                            url: null,
                            video_url: null,
                            delete: null,
                            type: "video",
                            id: uuidv4(),
                        });
                    }
                }
            }

            this.miniatures = arr;
        }     
           
    }
</script>

<style scoped>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/ImageVideoGalleria.css';
</style>