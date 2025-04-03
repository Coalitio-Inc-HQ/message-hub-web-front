<!-- /* Не используется */ -->
<template>
    <div class="avatar-border">
        <Image v-if="file_info.file.type.startsWith('image/')" :src="file_info.temp_url" alt="Image" class="image-container" imageClass="image" preview />
        <VideoItem v-else-if="file_info.file.type.startsWith('video/')" :url="file_info.temp_url" :name="file_info.file.name" :is_min_window="is_min_window" />
        <Button v-else class="flex-list downlad-file-button" @click="download(file_info.temp_url,file_info.file.name)">
            <i class="pi pi-file" style="font-size: 1.5rem"></i>
            <div class="flex-scale downlad-file-button-text">{{ file_info.file.name }}</div>
        </Button>
        <i class="pi pi-times delete-file-button" style="font-size: 0.75rem" @click="()=>{if (file_info.delete){file_info.delete();}}"></i>
        <ProgressBar v-if="!file_info.uploaded" :value="file_info.progress*100" class="progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
    </div>
</template>
<script>
    import Button from 'primevue/button';
    import Image from 'primevue/image';
    import VideoItem from './VideoItem.vue';
    import ProgressBar from 'primevue/progressbar';

    export default {
        props: ["file_info", "is_min_window"],
        components: {
            Image,
            Button,
            VideoItem,
            ProgressBar,
        },
        methods:{
            download(url, name){
                var link = document.createElement("a");
                link.download = name;
                link.href = url;
                link.click();
            }
        }
    }
</script>

<style>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/FileAvatar.css';
</style>