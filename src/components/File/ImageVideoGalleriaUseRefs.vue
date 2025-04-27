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
                <i v-if="'uploaded' in image && !image.uploaded" class="pi pi-times miniature-item-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null, null); image.delete_call(); e.preventDefault();}"/>
                <ProgressBar v-if="'progress' in image && !image.uploaded" :value="image.progress*100" class="miniature-item-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
            </Button>
        </template>

        <template v-if="'videos' in this.$props.attachments && this.$props.attachments.videos.length>0">
            <Button
                v-for="video in this.$props.attachments.videos"
                class="miniature-item"
                :key="video.id"
                @click="openMiniature(video.id,'videos')"
            >
                <i v-if="video.miniature.loading" class="pi pi-spin pi-spinner"/>
                <ImageComponent v-else class="miniature-image" container_class="miniature-image-container" use_background_image="True" :src="video.miniature.url" alt=" "/>
                <i class="pi pi-caret-right miniature-item-show-icon"/>
                <i v-if="'uploaded' in video && (!video.uploaded || !video.miniature.uploaded)" class="pi pi-times miniature-item-delete-button" style="font-size: 0.75rem" @click="(e)=>{openMiniature(null, null); video.delete_call(); e.preventDefault();}"/>
                <ProgressBar v-if="'progress' in video && !video.uploaded || !video.miniature.uploaded" :value="video.progress*100" class="miniature-item-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
            </Button>
        </template>

        <Drawer v-if="this.openIndex!=null" v-model:visible="drawer_visible"  position="full">
            <template #header>
                <div class="flex-list-w drawer-heder-container">
                    <p class="text-2xl drawer-heder-text line-clamp-1 break-all">{{(this.openType=="images"? this.$props.attachments.images: this.$props.attachments.videos)[this.openIndex].name}}</p>
                    <div class="flex-scale"></div>
                    <Button v-if="this.openType=='images'" icon="pi pi-search-plus" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" @click="this.image_scale*=2"/>
                    <Button v-if="this.openType=='images'" icon="pi pi-search-minus" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" @click="this.image_scale/=2"/>
                    <Button v-if="'uploaded' in (this.openType=='images'? this.$props.attachments.images: this.$props.attachments.videos)[this.openIndex] && (!(this.openType=='images'? this.$props.attachments.images: this.$props.attachments.videos)[this.openIndex].uploaded || this.openType=='videos' && 'miniature' in this.$props.attachments.videos[this.openIndex] && !this.$props.attachments.videos[this.openIndex].miniature.uploaded)" icon="pi pi-trash" variant="outlined" class="min-w-[2.5rem] p-button p-component p-button-icon-only p-button-secondary p-button-rounded p-button-text p-drawer-close-button" 
                    @click="(e)=>{(this.openType=='images'? this.$props.attachments.images: this.$props.attachments.videos)[this.openIndex].delete_call(); openMiniature(null, null); e.preventDefault();}"/>
                </div>
            </template>
            <div class="full-container icon-slide-container" @mousemove="showSlideButtons">
                <ZoomImageComponent v-if="this.openType=='images'" :image_scale="this.image_scale" class="full-image" container_class="full-image-container" :src="this.$props.attachments.images[this.openIndex].url"/>
                <video v-else class="full-video" :src="this.$props.attachments.videos[this.openIndex].url" controls controlsList="nofullscreen"/>
            
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
    import ProgressBar from 'primevue/progressbar';
    import ImageComponent from '../ImageComponent.vue';
    import ZoomImageComponent from '../ZoomImageComponent.vue';

    export default {
        props: ["attachments"],

        components:{
            ImageComponent,
            Drawer,
            Button,
            ProgressBar,
            ZoomImageComponent,
        },

        methods:{
            openMiniature(id, openType){
                if (id){
                    this.openIndex = (openType=="images"? this.$props.attachments.images: this.$props.attachments.videos).findIndex(item => item.id === id);
                    if (this.openIndex!=-1){
                        this.image_scale=1;

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

                image_scale:1,
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