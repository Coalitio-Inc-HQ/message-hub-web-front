<template>
    <div class="flex flex-col h-full">
        <div class="bg-surface-500 gap-2 p-1.5 flex items-center flex-wrap">
            <Button v-if="this.SizeServiceStore.minWindow" variant="text" size="small" icon="pi pi-arrow-left" @click="this.$router.push('/ui/menu');"/>
            <h1 class="text-3xl">Управление</h1>
            <Select class="mt-1" v-model="selected_table" :options="selection_tables"/>
            <div class="grow"/>
            <Button 
                v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.user && AuthServiceStore.userInfo.role_permissions.user.update || this.AuthServiceStore.userInfo.is_root) && this.selected_table==='пользоавтлями' ||
                AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.role && AuthServiceStore.userInfo.role_permissions.role.update || this.AuthServiceStore.userInfo.is_root) && this.selected_table==='ролями'
                "
                :class="{'w-full': this.SizeServiceStore.minWindow}"
                icon="pi pi-plus" label="Создать новый элемент" @click="this.visible_create_dialog=true;"/>
        </div>
        <div class="grow bg-surface-500 p-2 overflow-hidden">
            <div class="bg-surface-700 size-full rounded-border p-2 ">
                <template v-if="this.selected_table==='пользоавтлями'">
                    <DataTable scrollable scrollHeight="flex" v-model:selection="selected_users" v-model:editingRows="editing_users" :value="users" editMode="row" dataKey="id" @row-edit-save="row_edit_save_user"
                        :pt="{
                            // table: { style: 'min-width: 50rem' },
                            column: {
                                bodycell: ({ state }) => ({
                                    style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                                })
                            }
                        }"
                    >
                        <Column v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.user && AuthServiceStore.userInfo.role_permissions.user.update || this.AuthServiceStore.userInfo.is_root)"
                         selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="name" header="Имя" sortable style="width: auto;min-width: 15rem;">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" class="w-full" />
                            </template>
                        </Column>
                        <Column field="email" header="email" sortable style="width: auto;min-width: 15rem;">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid class="w-full" />
                            </template>
                        </Column>
                        <Column field="role_id" header="Роль" sortable sortField="role_id" style="width: auto">
                            <template #editor="{ data, field }">
                                <template v-if="data['is_root']">
                                    <p class="text-nowrap">Супер пользователь</p>
                                </template>
                                <template v-else>
                                    <!-- <Select v-model="data[field]" :options="roles" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid  class="w-full"/> -->
                                    <Select v-model="data[field]" :options="selection_roles" option-label="name"  class="w-full" placeholder="Роль" option-value="id"/>
                                </template>
                            </template>
                            <template #body="slotProps">
                                <template v-if="slotProps.data.is_root">
                                    <p class="text-nowrap">Супер пользователь</p>
                                </template>
                                <template v-else>
                                    <!-- <p>{{this.selection_roles[slotProps.data.role_id].name}}</p> -->
                                    <p>{{ selection_roles.find(role => role.id === slotProps.data.role_id)?.name || "Роль не найдена" }}</p>
                                </template>
                            </template>
                        </Column>
                        <Column 
                        v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.user && AuthServiceStore.userInfo.role_permissions.user.password && AuthServiceStore.userInfo.role_permissions.user.password.chenge.init || this.AuthServiceStore.userInfo.is_root)" 
                        field="password" header="Пароль" style="width: auto">
                            <template #editor="{ data, field }">
                                <!-- <FloatLabel class="input-field-box">
                                    <Password inputClass="input-field" class="input-field" v-model="data[field]" :feedback="false" toggleMask />
                                    <label for="password">Пароль</label>
                                </FloatLabel> -->
                                <Button class="text-nowrap" label="Создать ссылку востановления пароля" />
                            </template>
                            <template #body="slotProps">
                                <template v-if="slotProps.data.request_password_await">
                                    <Button class="text-nowrap" label="Ссылка создаётся ..." disabled />
                                </template>
                                <template v-else>
                                    <template v-if="slotProps.data.ref_token">
                                        <Button v-if="slotProps.data.copped_link" class="text-nowrap" label="Ссылка скопирована" disabled />
                                        <Button v-else class="text-nowrap" label="Скопировать ссылку" @click="coppyChengePasswordLink(slotProps.data)"/>
                                    </template>
                                    <Button v-else class="text-nowrap" label="Создать ссылку востановления пароля" @click="init_chnge_password(slotProps.data)" />
                                </template>
                            </template>
                        </Column>
                        <Column 
                        v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.user && AuthServiceStore.userInfo.role_permissions.user.update || this.AuthServiceStore.userInfo.is_root)"
                        :rowEditor="true" style="width: auto" bodyStyle="text-align:center"></Column>
                        <template v-if="selected_users.length" #footer>
                            <Button v-if="!delete_user_await" icon="pi pi-trash"  label="Удалить выбранных пользователей" @click="confirm_delete_users"/>
                            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="delete_user_error" severity="error">{{delete_user_error}}</Message>
                            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="delete_user_await" severity="info">Идёт удаление ролей</Message>
                        </template>
                    </DataTable>
                </template>

                <template v-else>
                    <DataTable scrollable scrollHeight="flex" v-model:selection="selected_roles" v-model:editingRows="editing_roles" :value="roles" editMode="row" dataKey="id" @row-edit-save="row_edit_save_role"
                        :pt="{
                            column: {
                                bodycell: ({ state }) => ({
                                    style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                                })
                            }
                        }"
                    >
                        <Column
                            v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.role && AuthServiceStore.userInfo.role_permissions.role.update || this.AuthServiceStore.userInfo.is_root)"
                            selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="name" header="Название роли" sortable style="width: auto">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" />
                            </template>
                        </Column>
                        <Column field="permissions" header="Разрешения" style="width: auto">
                            <template #editor="{ data, field }">
                                <Button class="text-nowrap" label="Изменить"
                                @click="console.log(1); this.edit_dialog_obj=data; this.edit_dialog_read_only=false; this.visible_edit_dialog=true;"
                                />
                            </template>
                            <template #body="slotProps">
                                <Button class="text-nowrap" label="Просмотреть" @click="this.edit_dialog_obj=slotProps.data; this.edit_dialog_read_only=true; this.visible_edit_dialog=true;"/>
                            </template>
                        </Column>
                        <Column
                            v-if="AuthServiceStore.userInfo &&(AuthServiceStore.userInfo.role_permissions && AuthServiceStore.userInfo.role_permissions.role && AuthServiceStore.userInfo.role_permissions.role.update || this.AuthServiceStore.userInfo.is_root)" 
                            :rowEditor="true" style="width: auto" bodyStyle="text-align:center"></Column>
                        <template v-if="selected_roles.length" #footer>
                            <Button v-if="!delete_role_await" icon="pi pi-trash"  label="Удалить выбраные роли" @click="confirm_delete_roles"/>
                            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="delete_role_error" severity="error">{{delete_role_error}}</Message>
                            <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="delete_role_await" severity="info">Идёт удаление ролей</Message>
                        </template>
                    </DataTable>
                </template>
            </div>
        </div>
    </div>


    <Dialog v-model:visible="visible_create_dialog" modal :header="this.selected_table === 'пользоавтлями'?'Создание пользователя': 'Создание роли'">
        <div class="flex flex-col gap-2 mb-4 p-2">
            <template v-if="this.selected_table === 'пользоавтлями'">
                <userComponent v-model:user="this.creating_user" :roles="selection_roles" :read_only="false"/>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_user_error" severity="error">{{creating_user_error}}</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_user_await" severity="info">Идёт создание пользователя</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_user_succes" severity="info">Пользователь создан</Message>
                <Button  v-if="!creating_user_await && !creating_user_succes" label="Создать" @click="clik_create_user"/>
            </template>
            <template v-else>
                <roleComponent v-model:role="this.creating_role" :read_only="false"/>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_role_error" severity="error">{{creating_role_error}}</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_role_await" severity="info">Идёт создание роли</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="creating_role_succes" severity="info">Роль создана</Message>
                <Button  v-if="!creating_role_await && !creating_role_succes" label="Создать" @click="clik_create_role"/>
            </template>
        </div>
    </Dialog>

    <Dialog v-model:visible="visible_edit_dialog" modal :header="this.selected_table === 'пользоавтлями'?'Редактирование пользователя': 'Редактирование роли'">
        <div class="flex flex-col gap-2 mb-4 p-2">
            <template v-if="this.selected_table === 'пользоавтлями'">

            </template>
            <template v-else>
                <roleComponent v-model:role="this.edit_dialog_obj" :read_only="edit_dialog_read_only"/>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="this.edit_dialog_obj.request_error" severity="error">{{this.edit_dialog_obj.request_error}}</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="this.edit_dialog_obj.request_await" severity="info">Идёт обновление роли</Message>
                <Message class="w-full text-wrap whitespace-pre-wrap mt-1" v-if="this.edit_dialog_obj.request_succes" severity="info">Роль сохранена</Message>
            </template>
            <Button v-if="!this.edit_dialog_read_only" label="Сохранить" @click="clik_edit"/>
        </div>
    </Dialog>
    <ConfirmDialog></ConfirmDialog>
</template>
  
<script>
    import InputText from 'primevue/inputtext';
    import FloatLabel from 'primevue/floatlabel';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import Avatar from 'primevue/avatar';
    import SelectButton from 'primevue/selectbutton';
    import Select from 'primevue/select';
    import Dialog from 'primevue/dialog';
    import ToggleButton from 'primevue/togglebutton';
    import { Message } from 'primevue';
    import ConfirmDialog from 'primevue/confirmdialog';

    import DataTable from 'primevue/datatable';
    import Column from 'primevue/column';
    import ColumnGroup from 'primevue/columngroup'; 
    import Row from 'primevue/row';

    import roleComponent from '@/components/admin/roleComponent.vue';
    import userComponent from '@/components/admin/userComponent.vue';

    import { mapStores } from 'pinia'
    import { useAuthService } from '@/services/authService';
    import { useSizeService } from '@/services/sizeService';

    import router from '@/router';

    import axios from 'axios';

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const USER_LIST_URL = BASE_URL + import.meta.env.VITE_USER_LIST_URL;
    const USER_CREATE_URL = BASE_URL + import.meta.env.VITE_USER_CREATE_URL;
    const USER_UPDATE_URL = BASE_URL + import.meta.env.VITE_USER_UPDATE_URL;
    const USER_DELETE_URL = BASE_URL + import.meta.env.VITE_USER_DELETE_URL;
    const USER_PASSWORD_CHENGE_INIT_URL = BASE_URL + import.meta.env.VITE_USER_PASSWORD_CHENGE_INIT_URL; 

    const ROLE_LIST_URL = BASE_URL + import.meta.env.VITE_ROLE_LIST_URL;
    const ROLE_CREATE_URL = BASE_URL + import.meta.env.VITE_ROLE_CREATE_URL;
    const ROLE_UPDATE_URL = BASE_URL + import.meta.env.VITE_ROLE_UPDATE_URL;
    const ROLE_DELETE_URL = BASE_URL + import.meta.env.VITE_ROLE_DELETE_URL;

    const THIS_BASE_URL = import.meta.env.VITE_THIS_BASE_URL;

    let await_auth = false;
  
    export default {
        components:{
            InputText,
            FloatLabel,
            Password,
            Button,
            Avatar,
            SelectButton,
            Select,
            DataTable,
            Column,
            ColumnGroup,
            Row,
            Dialog,
            ToggleButton,
            Message,
            roleComponent,
            ConfirmDialog,
            userComponent,
        },

        computed:{
            ...mapStores(useAuthService, useSizeService),
            selection_roles(){
                return [...this.roles, {"id": null, name: "Не назначена"}]
            },

            selection_tables(){
                const variants = [];
                if (this.AuthServiceStore.userInfo && this.AuthServiceStore.userInfo.role_permissions){
                    if (this.AuthServiceStore.userInfo.role_permissions.user.list){
                        variants.push('пользоавтлями');
                    }

                    if (this.AuthServiceStore.userInfo.role_permissions.role.list){
                        variants.push('ролями');
                    }
                }
                if (this.AuthServiceStore.userInfo && this.AuthServiceStore.userInfo.is_root){
                    this.selected_table = 'пользоавтлями';
                    return ['пользоавтлями', 'ролями']
                }

                this.selected_table = variants[0];
                return variants;
            }
        },
        data() {
            return {
                // selected_table: "пользоавтлями",
                selected_table: null,

                users: [],
                editing_users: [],
                selected_users: [],
                loading_users: false,
                loading_users_error: null,

                creating_user_await: false,
                creating_user_error: null,
                creating_user_succes: false,

                delete_user_await: false,
                delete_user_error: null,

                creating_user:{
                    name: null,
                    email: null,
                    role_id: null,
                    password: null,
                    icon_url: null,
                },


                roles: [],
                editing_roles: [],
                selected_roles: [],
                loading_roles: false,
                loading_roles_error: null,

                creating_role_await: false,
                creating_role_error: null,
                creating_role_succes: false,

                delete_role_await: false,
                delete_role_error: null,

                creating_role:{
                    name: null,
                    permissions: {
                        user:{
                            list: false,
                            update: false,
                            password:{
                                chenge:{
                                    init: false
                                }
                            }
                        },
                        // "user.list": false,
                        // 'user.update': false,

                        role:{
                            list: false,
                            update: false,
                        }
                        // 'role.list': false,
                        // 'role.update': false,
                    },
                },

                visible_create_dialog: false,
                visible_edit_dialog: false,

                edit_dialog_obj: null,
                edit_dialog_read_only: false,
            };
        },
        methods: {
            async reload_users(){
                let res = true;

                this.loading_users = true;
                this.loading_users_error = null;
                try{
                    const res = await axios.post(USER_LIST_URL, {token: this.AuthServiceStore.token});

                    this.users = res.data;
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.loading_users_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.loading_users_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            this.loading_users_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.loading_users_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                this.loading_users = false;

                return res;
            },

            clik_edit(){
                if (this.selected_table==="пользоавтлями"){

                }else{
                    this.clik_update_role(this.edit_dialog_obj);
                }
            },

            async reload_roles(){
                let res = true;

                this.loading_roles = true;
                this.loading_roles_error = null;
                try{
                    const res = await axios.post(ROLE_LIST_URL, {token: this.AuthServiceStore.token});

                    this.roles = res.data;
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.loading_roles_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.loading_roles_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            this.loading_roles_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.loading_roles_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                this.loading_roles = false;

                return res;
            },

            clear_create_role(){
                this.creating_role = {
                    name: null,
                    permissions: {
                        user:{
                            list: false,
                            update: false,
                            password:{
                                chenge:{
                                    init: false
                                }
                            }
                        },

                        role:{
                            list: false,
                            update: false,
                        }
                    },
                }
            },

            clik_create_role(){
                if (! this.creating_role.name){
                    this.creating_role_error = "Не введено название роли.";
                    return;
                }
                if (!this.creating_role_await){
                    this.create_role();
                }
            },

            async create_role(){
                let res = true;

                this.creating_role.permissions.role.create = this.creating_role.permissions.role.update
                this.creating_role.permissions.role.delete = this.creating_role.permissions.role.update

                this.creating_role.permissions.user.create = this.creating_role.permissions.user.update
                this.creating_role.permissions.user.delete = this.creating_role.permissions.user.update

                this.creating_role_await = true;
                this.creating_role_error = null;
                try{
                    const res = await axios.post(ROLE_CREATE_URL, {token: this.AuthServiceStore.token, role: this.creating_role});

                    this.roles.unshift(res.data);

                    this.creating_role_succes = true;
                    setTimeout(()=>{
                        this.creating_role_succes = false;
                        this.visible_create_dialog = false;
                        this.clear_create_role();
                    },1000);
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.creating_role_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.creating_role_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            this.creating_role_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.creating_role_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                this.creating_role_await = false;

                return res;
            },

            clik_update_role(role_obj){
                if (!role_obj.name){
                    role_obj.request_error = "Не введено название роли.";
                    return;
                }
                if (!role_obj.request_await){
                    this.update_role(role_obj);
                }
            },

            row_edit_save_role(event){
                if (!event.data.name){
                    event.data.request_error = "Не введено название роли.";
                    return;
                }
                if (!event.data.request_await){
                    this.update_role(event.data, event.newData);
                }
            },


            async update_role(role_obj, newData = null){
                const edit_obj = role_obj;

                edit_obj.permissions["role.create"] = edit_obj.permissions["role.update"]
                edit_obj.permissions["user.create"] = edit_obj.permissions["user.update"]

                let res = true;

                edit_obj.request_await = true;
                edit_obj.request_error = null;
                try{
                    const res = await axios.post(ROLE_UPDATE_URL, {token: this.AuthServiceStore.token, update_role: newData?newData: role_obj});

                    edit_obj.name = res.data.name;
                    edit_obj.permissions = res.data.permissions;

                    edit_obj.request_succes = true;
                    setTimeout(()=>{
                        edit_obj.request_succes = false;
                    },1000);
                    // if (edit_obj == this.edit_dialog_obj) this.visible_edit_dialog = false;
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            edit_obj.request_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            edit_obj.request_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            edit_obj.request_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        edit_obj.request_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                edit_obj.request_await = false;

                return res;
            },

            confirm_delete_roles(){
                let role_names = [];
                this.selected_roles.forEach((role)=>{role_names.push(role.name)});
                this.$confirm.require({"message":`Удалить роли:\n ${role_names.join(',')}?`, "acceptLabel": "Да", "rejectLabel": "Нет", "accept": ()=>this.delete_roles(this.selected_roles)});
            },

            async delete_roles(delete_roles){
                const ids = [];
                delete_roles.forEach((role)=>{ids.push(role.id)});

                let res = true;

                this.selected_roles = [];

                this.delete_role_await = true;
                this.delete_role_error = null;

                try{
                    const res = await axios.post(ROLE_DELETE_URL, {token: this.AuthServiceStore.token, role_ids: ids});

                    this.roles = this.roles.filter(item => !ids.includes(item.id));
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.delete_role_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.delete_role_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else if(error.response.status === 422 && "fail_delete_roles" in error.response.data){
                            this.delete_role_error = `Ошибка удаления ролей. Роли ${error.response.data.fail_delete_roles.join(',')} ещё назначены пользователям.`;
                            res ={
                                error: error,
                                description: `Ошибка удаления ролей. Роли ${error.response.data.fail_delete_roles.join(',')} ещё назначены пользователям.`,
                                status: error.response.status,
                            };
                        }else {
                            this.delete_role_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.delete_role_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }

                this.delete_role_await = false;
            },

            clear_create_user(){
                this.creating_user = {
                        name: null,
                        email: null,
                        role_id: null,
                        password: null,
                        icon_url: null,
                }
            },

            clik_create_user(){
                let errors = [];
                if (!this.creating_user.name){
                    errors.push("Не введено имя пользователя.");
                }
                if (!this.creating_user.email){
                    errors.push("Не введена электронная почта.");
                } else {
                    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!regex.test(this.creating_user.email)){
                        errors.push("Не введена не валидная электронная почта.");
                    }
                }

                if (!this.creating_user.password){
                    errors.push("Не введен пароль пользователя.");
                } else{
                    if(this.creating_user.password.length<8){
                        errors.push("Пароль короче 8 символов.");
                    }
                }

                if (errors.length){
                    this.creating_user_error = errors.join("\n");
                    return;
                }

                if (!this.creating_role_await){
                    this.create_user();
                }
            },

            async create_user(){
                let res = true;

                this.creating_user_await = true;
                this.creating_user_error = null;
                try{
                    const res = await axios.post(USER_CREATE_URL, {token: this.AuthServiceStore.token, register_info: this.creating_user});

                    this.users.unshift(res.data);

                    this.creating_user_succes = true;
                    setTimeout(()=>{
                        this.creating_user_succes = false;
                        this.visible_create_dialog = false;
                        this.clear_create_user();
                    },1000);
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.creating_user_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.creating_user_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            this.creating_user_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.creating_user_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                this.creating_user_await = false;

                return res;
            },

            row_edit_save_user(event){
                let errors = [];
                if (!event.data.name){
                    errors.push("Не введено имя пользователя.");
                }
                if (!event.data.email){
                    errors.push("Не введена электронная почта.");
                }

                if (errors.length){
                    event.data.request_error = errors.join("\n");
                    return;
                }

                if (!event.data.request_await){
                    this.update_user(event.data, event.newData);
                }
            },

            async update_user(user_obj, newData = null){
                const edit_obj = user_obj;

                let res = true;

                edit_obj.request_await = true;
                edit_obj.request_error = null;
                try{
                    const res = await axios.post(USER_UPDATE_URL, {token: this.AuthServiceStore.token, update_user: newData?newData: user_obj});

                    for (const key in res.data){
                        edit_obj[key] = res.data[key]
                    }

                    edit_obj.request_succes = true;
                    setTimeout(()=>{
                        edit_obj.request_succes = false;
                    },1000);
                    // if (edit_obj == this.edit_dialog_obj) this.visible_edit_dialog = false;
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            edit_obj.request_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            edit_obj.request_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            edit_obj.request_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        edit_obj.request_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                edit_obj.request_await = false;

                return res;
            },

            confirm_delete_users(){
                let user_names = [];
                this.selected_users.forEach((user)=>{user_names.push(user.name)});
                this.$confirm.require({"message":`Удалить пользователей:\n ${user_names.join(',')}?`, "acceptLabel": "Да", "rejectLabel": "Нет", "accept": ()=>this.delete_users(this.selected_users)});
            },

            async delete_users(delete_users){
                const ids = [];
                delete_users.forEach((users)=>{ids.push(users.id)});

                let res = true;

                this.selected_users = [];

                this.delete_user_await = true;
                this.delete_user_error = null;

                try{
                    const res = await axios.post(USER_DELETE_URL, {token: this.AuthServiceStore.token, user_ids: ids});

                    this.users = this.users.filter(item => !ids.includes(item.id));
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            this.delete_user_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            this.delete_user_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else if(error.response.status === 422 && "fail_delete_users" in error.response.data){
                            this.delete_user_error = "Ошибка удаления пользователей. Среди выбранных пользователей есть супер пользователь";
                            res ={
                                error: error,
                                description: "Ошибка удаления пользователей. Среди выбранных пользователей есть супер пользователь",
                                status: error.response.status,
                            };
                        } else {
                            this.delete_user_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        this.delete_user_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }

                this.delete_user_await = false;
            },


            async init_chnge_password(user_obj){
                if (user_obj.ref_token){
                    return true;
                }

                const edit_obj = user_obj;

                let res = true;

                edit_obj.request_password_await = true;
                edit_obj.request_password_error = null;
                try{
                    const res = await axios.post(USER_PASSWORD_CHENGE_INIT_URL, {token: this.AuthServiceStore.token, user_id: user_obj.id});

                    edit_obj.ref_token = res.data.token;

                    edit_obj.request_password_succes = true;
                    setTimeout(()=>{
                        edit_obj.request_password_succes = false;
                    },1000);
                } 
                catch(error){
                    if ("response" in error){
                        if (error.response.status === 401){
                            edit_obj.request_password_error = "Ошибка аутентификации.";
                            this.AuthServiceStore.failAuthFunc();

                            res ={
                                error: error,
                                description: "Ошибка аутентификации.",
                                status: 401,
                            };
                        } else if (error.response.status === 403){
                            edit_obj.request_password_error = "Ошибка. Недостаточно прав.";

                            this.AuthServiceStore.userInfo = error.response.data.detail;

                            res ={
                                error: error,
                                description: "Ошибка. Недостаточно прав.",
                                status: 403,
                            };
                        } else {
                            edit_obj.request_password_error = "Непредвиденная ошибка.";

                            res ={
                                error: error,
                                description: "Непредвиденная ошибка.",
                                status: error.response.status,
                            };
                        }
                    } else {
                        edit_obj.request_password_error = "Непредвиденная ошибка.";

                        res ={
                            error: error,
                            description: "Непредвиденная ошибка.",
                            status: null,
                        };
                    }
                }
                edit_obj.request_password_await = false;

                return res;
            },

            coppyChengePasswordLink(user_obj){
                navigator.clipboard.writeText(`${THIS_BASE_URL}/change-password?token=${encodeURIComponent(user_obj.ref_token)}&user_id=${encodeURIComponent(user_obj.id)}`);
                user_obj.copped_link = true;
                setTimeout(()=>{
                    user_obj.copped_link = false;
                },1000);
            }
        },

        

        wath:{
            "AuthServiceStore.token":{
                handler(newValue){
                    if (newValue && await_auth){
                        this.reload_users();
                        this.reload_roles();
                    }
                }
            }
        },

        mounted(){
            if (this.AuthServiceStore.token){
                this.reload_users();
                this.reload_roles();
            } else {
                await_auth = true;
            }
        },
    };
</script>
  