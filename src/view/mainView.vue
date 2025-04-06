<template>
    <div class="w-dvw h-dvh flex ">
        <div v-if="!this.SizeServiceStore.minWindow || this.splitedPath[2] ==='menu'"
         class="bg-surface-500 flex flex-col gap-2 p-1 border border-surface border-r-4"
         :class="{'w-full': this.SizeServiceStore.minWindow, 'p-5': this.SizeServiceStore.minWindow}"
        >
            <H1 v-if="this.SizeServiceStore.minWindow" class="text-4xl">Меню</H1>

            <div class="flex flex-col border border-surface rounded-border bg-primary-700 p-1" >
                <button class="flex flex-col items-center gap-1 cursor-pointer" :class="{'flex-row': this.open_left_menue}">
                    <template v-if="AuthServiceStore.userInfo">
                        <Avatar :label="this.AuthServiceStore.userInfo.name[0]" />
                        <template v-if="this.open_left_menue">
                            <p class="text-base">{{ this.AuthServiceStore.userInfo.name }}</p>
                            <div class="grow"/>
                        </template>
                    </template>
                    <template v-else>
                        <Skeleton size="2rem" width="2rem" class="mr-2"/>
                        <template v-if="this.open_left_menue">
                            <Skeleton class="mb-2" width="5rem"/>
                            <div class="grow"/>
                        </template>
                    </template>
                </button>
            </div>

            <div class="grow flex flex-col gap-2 border border-surface rounded-border bg-primary-700 p-1" >

                <Button variant="text" size="small"
                :class="{'!bg-primary-contrast': this.splitedPath[2] === 'chat' || this.SizeServiceStore.minWindow}"
                @click="this.$router.push('/ui/chat')">

                    <i class="pi pi-comments"/>
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Диалоги</p>
                    </template>
                </Button>

                <Button variant="text" size="small"
                :class="{'!bg-primary-contrast': this.splitedPath[2] === 'admin' || this.SizeServiceStore.minWindow}"
                @click="this.$router.push('/ui/admin')">

                    <i class="pi pi-address-book"/>
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Контроль доступа</p>
                    </template>
                </Button>

                <Button variant="text" size="small" @click="open_tg_bot"
                :class="{'!bg-primary-contrast': this.SizeServiceStore.minWindow}"
                >
                    <i class="pi pi-telegram"/>
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Telegram bot</p>
                    </template>
                </Button>

                <div class="grow"/>
                <Button variant="text" size="small" @click="this.AuthServiceStore.logOut(); this.$router.push('/login');"
                :class="{'!bg-primary-contrast': this.SizeServiceStore.minWindow}"
                >
                    <i class="pi pi-sign-out"/>
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Выйти</p>
                    </template>
                </Button>
                <Button v-if="!this.SizeServiceStore.minWindow" variant="text" size="small" @click="this.open_left_menue=!this.open_left_menue"
                :class="{'!bg-primary-contrast': this.SizeServiceStore.minWindow}"
                >
                    <i v-if="this.open_left_menue" class="pi pi-arrow-left"/>
                    <i v-else class="pi pi-arrow-right"/>
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Свернуть</p>
                    </template>
                </Button>

            </div>

        </div>
        <div v-if="!this.SizeServiceStore.minWindow || this.splitedPath[2] !=='menu'" class="grow overflow-hidden">
            <router-view></router-view>
        </div>
    </div>
</template>
  
<script>
    import InputText from 'primevue/inputtext';
    import FloatLabel from 'primevue/floatlabel';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import Avatar from 'primevue/avatar';

    import { mapStores } from 'pinia'
    import { useAuthService } from '@/services/authService';
    import { useSizeService } from '@/services/sizeService';

    import router from '@/router';
  
    export default {
        components:{
            InputText,
            FloatLabel,
            Password,
            Button,
            Avatar,
        },

        watch:{
            "SizeServiceStore.minWindow":{
                handler(newValue){
                    if (newValue){
                        this.open_left_menue=true;
                    }
                }
            }
        },
        computed:{
            ...mapStores(useAuthService, useSizeService),
            splitedPath() {
                return this.$route.path.split('/');
            }
        },
        data() {
            return {
            open_left_menue: false,
            tg_bot_ref: import.meta.env.VITE_TG_BOT_REF,
            };
        },
        methods: {
            open_tg_bot(){
                console.log(this.tg_bot_ref);
                const newTab = window.open(this.tg_bot_ref, '_blank'); 
                if (newTab) {
                newTab.opener = null;
                }
            },
        },
        created(){
            this.open_left_menue = this.SizeServiceStore.minWindow;
        }
    };
</script>
  