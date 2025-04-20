<template>
    <div class="w-dvw h-dvh flex ">
        <div v-if="!this.SizeServiceStore.minWindow || this.splitedPath[2] ==='menu'"
         class="bg-surface-500 flex flex-col gap-2 p-1 border border-surface border-r-4"
         :class="{'w-full': this.SizeServiceStore.minWindow, 'p-5': this.SizeServiceStore.minWindow}"
        >
            <H1 v-if="this.SizeServiceStore.minWindow" class="text-4xl">Меню</H1>

            <div class="flex flex-col border border-surface rounded-border bg-primary-700 p-1" >
                <button class="flex flex-col items-center gap-1 cursor-pointer" :class="{'flex-row': this.open_left_menue}" @click="this.visible_user_profile_dialog=true;">
                    <template v-if="AuthServiceStore.userInfo">
                        <Avatar v-if="this.AuthServiceStore.userInfo.icon_url" :image="this.AuthServiceStore.userInfo.icon_url" shape="square" style="border-radius: 8px;">
                            <img :src="this.AuthServiceStore.userInfo.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
                        </Avatar>
                        <Avatar v-else :label="this.AuthServiceStore.userInfo.name[0]"/>
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

                <Button 
                v-if="AuthServiceStore.userInfo && (AuthServiceStore.userInfo.role_permissions && (AuthServiceStore.userInfo.role_permissions.role.list || AuthServiceStore.userInfo.role_permissions.user.list) || AuthServiceStore.userInfo.is_root)"
                variant="text" size="small"
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
                        <p class="text-left text-color text-base">Telegram бот</p>
                    </template>
                </Button>

                <Button variant="text" size="small" @click="open_vk_bot"
                :class="{'!bg-primary-contrast': this.SizeServiceStore.minWindow}"
                >

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1rem"
                    height="1rem"
                    viewBox="0 0 200 200"
                    >
                        <mask id="text-mask-1">
                            <rect x="0" y="0" width="200" height="200" fill="white"/>
                            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="black" font-family="Arial, sans-serif" font-size="100" font-weight="bold">
                            VK
                            </text>
                        </mask>
                        <rect x="0" y="0" width="200" height="200" rx="30" style="fill: var(--p-button-text-primary-color);" mask="url(#text-mask-1)"/>
                    </svg>
                    
                    <template v-if="this.open_left_menue">
                        <div class="grow"/>
                        <p class="text-left text-color text-base">Сообество ВКонтакте</p>
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

    <Dialog v-model:visible="visible_user_profile_dialog" modal header="Сведения о пользователе"
    :pt="{
        header:{
             class: '!p-2'
        },
        content:{
            class: '!p-2'
        }
    }">
        <div class="flex flex-col gap-2 p-2">
            <div class="flex gap-2 items-center">
                <template v-if="AuthServiceStore.userInfo">
                    <div class="relative">
                        <Avatar v-if="this.profile_edit_data.icon_url" :image="this.profile_edit_data.icon_url" shape="square" style="border-radius: 8px;" size="xlarge">
                            <img :src="this.profile_edit_data.icon_url" loading="lazy" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
                        </Avatar>
                        <template v-else>
                            <Avatar v-if="this.profile_edit_data.name" :label="this.profile_edit_data.name[0]" size="xlarge"/>
                        </template>
                        <i class="pi pi-pencil bg-primary-500 absolute top-0 right-0 border rounded-xl border-border-surface p-1 transform translate-x-1/2 -translate-y-1/2 text-xs" @click="choise_files"/>
                        <ProgressBar v-if="upload_file_info" :value="upload_file_info.progress*100" class="!h-[5px] !absolute bottom-0 w-full  transform -translate-y-full">{{  }}</ProgressBar>
                    </div>

                    <FloatLabel variant="on" class="grow">
                        <InputText name="name" type="text" id="username" v-model="this.profile_edit_data.name" class="w-full"/>
                        <label for="name">Имя пользователя</label>
                    </FloatLabel>
                </template>
                <template v-else>
                    <Skeleton size="2rem" width="2rem" class="mr-2"/>
                    <Skeleton class="mb-2 grow" width="5rem"/>
                </template>
            </div>
            <FloatLabel variant="on" class="grow">
                <InputText name="email" type="text" id="email" v-model="this.profile_edit_data.email" class="w-full"/>
                <label for="email">Электронная почта</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <Password inputClass="input-field" class="input-field" v-model="this.profile_edit_data.password" :feedback="false" toggleMask />
                <label for="password">Новый пароль (не обязательно)</label>
            </FloatLabel>
            <FloatLabel variant="on">
                <Password inputClass="input-field" class="input-field" v-model="this.profile_edit_data.password1" :feedback="false" toggleMask />
                <label for="password1">Подтверждение пароля</label>
            </FloatLabel>

            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="update_profile_error" severity="error">{{update_profile_error}}</Message>
            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="update_profile_await" severity="info">Идёт обновление сведений</Message>
            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="update_profile_succes" severity="success">Сведения обновлены</Message>

            <Button  label="Сохранить" @click="update_user(this.profile_edit_data)"/>
        </div>
    </Dialog>
</template>
  
<script>
    import InputText from 'primevue/inputtext';
    import FloatLabel from 'primevue/floatlabel';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import Avatar from 'primevue/avatar';
    import Dialog from 'primevue/dialog';

    import { mapStores } from 'pinia'
    import { useAuthService } from '@/services/authService';
    import { useSizeService } from '@/services/sizeService';

    import { upload_file } from '@/services/S3Service';
    import ProgressBar from 'primevue/progressbar';
    import { Message } from 'primevue';

    import router from '@/router';
    import axios from 'axios';
  
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const USER_UPDATE_URL = BASE_URL + import.meta.env.VITE_USER_UPDATE_URL;

    export default {
        components:{
            InputText,
            FloatLabel,
            Password,
            Button,
            Avatar,
            Dialog,
            ProgressBar,
            Message,
        },

        watch:{
            "SizeServiceStore.minWindow":{
                handler(newValue){
                    if (newValue){
                        this.open_left_menue=true;
                    }
                }
            },

            "AuthServiceStore.userInfo":{
                handler(newValue){
                    if (newValue){
                        this.profile_edit_data.icon_url = newValue.icon_url;
                        this.profile_edit_data.name = newValue.name;
                        this.profile_edit_data.email = newValue.email;
                        this.profile_edit_data.password = null;
                        this.profile_edit_data.password1 = null;
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
                vk_bot_ref: import.meta.env.VITE_VK_BOT_REF,

                visible_user_profile_dialog: false,
                profile_edit_data:{
                    icon_url: null,
                    name: null,
                    email: null,
                    password: null,
                    password1: null,
                },

                upload_file_info: null,
                fail_upload_file: null,

                update_profile_await: false,
                update_profile_error: null,
                update_profile_succes: false,
            };
        },
        methods: {
            open_tg_bot(){
                const newTab = window.open(this.tg_bot_ref, '_blank'); 
                if (newTab) {
                newTab.opener = null;
                }
            },

            open_vk_bot(){
                const newTab = window.open(this.vk_bot_ref, '_blank'); 
                if (newTab) {
                newTab.opener = null;
                }
            },


            choise_files(){
                const input = document.createElement('input');
                input.type = 'file'; // Устанавливаем тип файла
                input.accept = 'image/*'; // Ограничения на типы файлов (например, '.jpg,.png,.pdf')
                input.multiple = false;

                input.addEventListener('change', () => {
                    if (input.files.length > 0) {
                        const faile = input.files[0];
                        let token = this.AuthServiceStore.token;

                        let u_file = upload_file(faile, token);
                        u_file.value.delete_call = ()=>{
                            
                        };

                        u_file.value.err_download_call_back = ()=>{
                            
                            u_file.value.delete_call();
                        };
                        
                        if (this.upload_file_info) this.upload_file_info.download_call_back = ()=>{};
                
                        u_file.value.download_call_back = (response)=>{
                            u_file.value.uploaded = true;
                            u_file.value.progress = 1;
                            u_file.value.uploaded_url = response.data.url;

                            this.profile_edit_data.icon_url = u_file.value.uploaded_url;
                            this.upload_file_info = null;
                        }
                        
                        this.profile_edit_data.icon_url = u_file.value.url;
                        this.upload_file_info = u_file;
                    }
                });

                input.click();
            },


            async update_user(user_obj){
                const errors = [];
                if (!user_obj.name){
                    errors.push("Не введено имя пользователя.");
                }
                if (!user_obj.email){
                    errors.push("Не введена электронная почта.");
                }
                if (user_obj.password && user_obj.password!=user_obj.password1){
                    errors.push("Пароли не совподают.");
                }

                if (errors.length){
                    this.update_profile_error = errors.join("\n");
                    return;
                }

                const edit_obj = {
                    id: this.AuthServiceStore.userInfo.id,
                    name: user_obj.name,
                    email: user_obj.email,
                    icon_url: user_obj.icon_url
                };
                if (user_obj.password){
                    edit_obj.password = user_obj.password;
                }


                let res = true;
                this.update_profile_await = true;
                this.update_profile_error = null;
                try{
                    const res = await axios.post(USER_UPDATE_URL, {token: this.AuthServiceStore.token, update_user: edit_obj});

                    for (const key in res.data){
                        this.AuthServiceStore.userInfo[key] = res.data[key]
                    }

                    this.update_profile_succes = true;
                    setTimeout(()=>{
                        this.update_profile_succes = false;
                    },1000);
                    // if (edit_obj == this.edit_dialog_obj) this.visible_edit_dialog = false;
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.update_profile_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.update_profile_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            this.update_profile_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.update_profile_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                this.update_profile_await = false;

                return res;
            },
        },

        created(){
            this.open_left_menue = this.SizeServiceStore.minWindow;

            if (this.AuthServiceStore.userInfo){
                this.profile_edit_data.icon_url = this.AuthServiceStore.userInfo.icon_url;
                this.profile_edit_data.name = this.AuthServiceStore.userInfo.name;
                this.profile_edit_data.email = this.AuthServiceStore.userInfo.email;
                this.profile_edit_data.password = null;
                this.profile_edit_data.password1 = null;
            }
        }
    };
</script>
  