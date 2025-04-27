<template>
    <div class="flex-list file-list">
        <Button 
        v-for="file in attachments.files"
        :key="file.id"
        class="downlad-file-button" 
        @click="(e)=>{this.download(file.url, file.name); console.log('123',e);}">
            <i class="pi pi-file file-icon" style="font-size: 1.5rem">
                <ProgressBar v-if="'uploaded' in file &&!file.uploaded" :value="file.progress*100" class="downlad-file-button-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
            </i>
            <p class="file-name flex-scale">{{file.name }}</p>
            <i v-if="'progress' in file && !file.uploaded" class="pi pi-times" style="font-size: 1.5rem" @click.stop="(e)=>{ file.delete_call(); e.preventDefault(); this.$forceUpdate();}"/>
        </Button>
    </div>
</template>
<script>
    import Button from 'primevue/button';
    import ProgressBar from 'primevue/progressbar';
    export default {
        props: ["attachments"],

        components:{
            Button,
            ProgressBar,
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