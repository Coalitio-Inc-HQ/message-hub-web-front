<template>
    <div>
        <FloatLabel variant="on">
            <InputText name="name" type="text" id="username" v-model="role.name" class="w-full" :disabled="read_only"/>
            <label for="name">Название роли</label>
        </FloatLabel>
    </div>
    <span class="text-surface-500 dark:text-surface-400 block mt-2">Контроль достуа.</span>
    <div class="flex items-center gap-1">
        <p>Просмотр списка пользователей</p>
        <div class="grow"/>
        <ToggleButton v-model="role.permissions.user.list" onLabel="Да" offLabel="Нет" :disabled="read_only" />
    </div>
    <div class="flex items-center gap-1">
        <p>Редактирование пользователей</p>
        <div class="grow"/>
        <ToggleButton v-model="role.permissions.user.update" onLabel="Да" offLabel="Нет" :disabled="read_only" />
    </div>

    <div class="flex items-center gap-1">
        <p>Просмотр списка ролей</p>
        <div class="grow"/>
        <ToggleButton v-model="role.permissions.role.list" onLabel="Да" offLabel="Нет" :disabled="read_only" />
    </div>
    <div class="flex items-center gap-1">
        <p>Редактирование ролей</p>
        <div class="grow"/>
        <ToggleButton v-model="role.permissions.role.update" onLabel="Да" offLabel="Нет" :disabled="read_only" />
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
            "role",
            "read_only",
        ],
        emits: [
            "update:role"
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
  