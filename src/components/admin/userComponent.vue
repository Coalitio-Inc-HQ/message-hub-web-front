<template>
    <div>
        <FloatLabel variant="on">
            <InputText name="name" type="text" id="username" v-model="user.name" class="w-full" :disabled="read_only"/>
            <label for="name">Имя пользователя</label>
        </FloatLabel>
    </div>
    <div>
        <FloatLabel variant="on">
            <InputText name="email" type="text" id="email" v-model="user.email" class="w-full" :disabled="read_only"/>
            <label for="email">Электронная почта</label>
        </FloatLabel>
    </div>
    <div>
        <Select v-model="user.role_id" :options="roles" option-label="name"  class="w-full" placeholder="Роль" option-value="id"/>
    </div>
    <div>
        <FloatLabel variant="on">
            <InputText name="password" type="text" id="password" v-model="user.password" class="w-full" :disabled="read_only"/>
            <label for="password">Пароль</label>
        </FloatLabel>
    </div>
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

    import DataTable from 'primevue/datatable';
    import Column from 'primevue/column';
    import ColumnGroup from 'primevue/columngroup'; 
    import Row from 'primevue/row';
  
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
        },
        props:[
            "user",
            "roles",
            "read_only",
        ],
        emits: [
            "update:user"
        ],
        computed:{
        },
        data() {
            return {
            };
        },
        methods: {
        },
    };
</script>
  