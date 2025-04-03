<template>
    <div class="flex-list file-list">
        <!-- <div v-for="file in attachments.files"
            :key="file.id"
            class="flex-list-w"
        > -->
            <Button 
            v-for="file in attachments.files"
            :key="file.id"
            class="downlad-file-button" 
            @click="download(file.url, file.name)">
                <i class="pi pi-file" style="font-size: 1.5rem"></i>
                <p class="file-name flex-scale">{{file.name }}</p>
            </Button>
            <!-- <i v-if="is_temp_messge" class="pi pi-times delete-file-button" style="font-size: 0.75rem" @click="()=>{if (file.value.delete){file.value.delete();}}"></i> -->
        <!-- </div> -->
    </div>
</template>
<script>
    import Button from 'primevue/button';

    export default {
        props: ["attachments"],

        components:{
            Button,
        },

        methods:{
            download(url, name){
                var link = document.createElement("a");
                link.download = name;
                link.href = url;
                link.click();
            }
        },

        data(){
            return {

            }
        },
    
    }
</script>

<style>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/FileList.css';
</style>