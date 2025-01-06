<template>
    <div class="flex-list file-list">
        <Button 
        v-for="file in attachments.files"
        :key="file.value.id"
        class="downlad-file-button" 
        @click="(e)=>{this.download(file.value.temp_url, file.value.name); console.log('123',e);}">
            <i class="pi pi-file file-icon" style="font-size: 1.5rem">
                <ProgressBar v-if="!file.value.uploaded" :value="file.value.progress*100" class="downlad-file-button-progressbar" style="height: 6px; position: absolute;">{{ "" }}</ProgressBar>
            </i>
            <p class="file-name flex-scale">{{file.value.name }}</p>
            <i v-if="!file.value.uploaded" class="pi pi-times" style="font-size: 1.5rem" @click.stop="(e)=>{ file.value.delete_call(); e.preventDefault(); this.$forceUpdate();}"/>
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

<style scoped>
    @import '@/assets/ChatComponent.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
    @import '@/assets/FileList.css';
</style>