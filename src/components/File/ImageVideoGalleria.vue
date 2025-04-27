<template>
    <div class="galleria">
        <template v-if="'images' in this.$props.attachments && this.$props.attachments.images.length>0">
            <Button
                v-for="image in this.$props.attachments.images"
                class="miniature-item"
                :key="image.id"
                @click="openMiniature(image.id,'images')"
            >
                <ImageComponent class="miniature-image" container_class="miniature-image-container" use_background_image="True" :src="image.url" alt=" "/>
                <i class="pi pi-eye miniature-item-show-icon"/>
            </Button>
        </template>

        <template v-if="'videos' in this.$props.attachments && this.$props.attachments.videos.length>0">
            <Button
                v-for="video in this.$props.attachments.videos"
                class="miniature-item"
                :key="video.id"
                @click="openMiniature(video.id,'videos')"
            >
                <ImageComponent class="miniature-image" container_class="miniature-image-container" use_background_image="True" :src="video.miniature.url" alt=" "/>
                <i class="pi pi-caret-right miniature-item-show-icon"/>
            </Button>
        </template>

        <Drawer v-if="this.openIndex!=null" v-model:visible="drawer_visible"  position="full">
            <template #header>
                <div class="flex-list-w drawer-heder-container">
                    <p class="drawer-heder-text line-clamp-1">{{(this.openType=="images"? this.$props.attachments.images: this.$props.attachments.videos)[this.openIndex].name}}</p>
                    <div class="flex-scale"></div>
                    <Button v-if="is_temp_messge" icon="pi pi-trash" variant="outlined" class="drawer-delete-button p-button-rounded p-button-text p-button-secondary" @click="this.miniatures[this.openIndex].delete"/>
                </div>
            </template>
            <div class="full-container icon-slide-container" @mousemove="showSlideButtons">
                <ImageComponent v-if="this.openType=='images'" class="full-image" container_class="full-image-container" :src="this.$props.attachments.images[this.openIndex].url" alt=" " :use_background_image="false"/>
                <video v-else class="full-video" :src="this.$props.attachments.videos[this.openIndex].url" controls/>
            
                <i v-if="this.visible_slide_buttons && (this.openIndex>0 && this.openType=='images' || this.openType=='videos' && this.openIndex>0 || this.openType=='videos' && 'images' in this.$props.attachments && this.$props.attachments.images.length>0)" class="pi pi-chevron-left icon-slide-left" 
                    @click="if (this.openIndex-1>-1){this.openIndex=this.openIndex-1;} else {if (this.openType=='videos'){this.openIndex = this.$props.attachments.images.length-1; this.openType = 'images';}}  "/>
                <i v-if="this.visible_slide_buttons && (this.openType=='images' && this.openIndex<this.$props.attachments.images.length-1 || this.openType=='images' && 'videos' in this.$props.attachments && this.$props.attachments.videos.length>0 || this.openType=='videos' &&  this.openIndex<this.$props.attachments.videos.length-1)" class="pi pi-chevron-right icon-slide-right" 
                    @click="if (this.openType=='images' && this.openIndex+1 == this.$props.attachments.images.length){this.openIndex=0;this.openType='videos';}else{ this.openIndex=this.openIndex+1;}"/>
            </div>

        </Drawer>
    </div>
</template>
<script>
    import Drawer from 'primevue/drawer';
    import Button from 'primevue/button';

    import ImageComponent from '../ImageComponent.vue';

    export default {
        props: ["attachments"],

        components:{
            ImageComponent,
            Drawer,
            Button,
        },

        methods:{
            openMiniature(id, openType){
                if (id){
                    this.openIndex = (openType=="images"? this.$props.attachments.images: this.$props.attachments.videos).findIndex(item => item.id === id);
                    if (this.openIndex!=-1){
                        this.openType=openType;
                        this.drawer_visible=true;
                    } else{
                        this.openIndex = null;
                        this.openType=null;
                        this.drawer_visible=false;                            
                    }
                }else{
                    this.openIndex = null;
                    this.openType=null;
                    this.drawer_visible=false;                    
                }
                console.log(this.openIndex, this.openType);
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
        },

        data(){
            return {
                openIndex: null,
                openType: null,
                drawer_visible: false,
                visible_slide_buttons: false,
                hideTimeout: null,
            }
        },
    }
</script>

<style>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/ImageVideoGalleria.css';
</style>