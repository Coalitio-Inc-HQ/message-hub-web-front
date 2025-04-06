<template>
  <div :class="{'flex-scale':button_waiting_chats, 'flex-list': true, 'overflow-h-hiddne': button_waiting_chats}" >
    <div class="chat-group-button-box">
      <Button ref="button_waiting_chats" class="chat-group-button w-full" @click="ClicOnButtonInListWaitingChats" >Входящие чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_waiting_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="waitingAnswerChats.length">
            <template 
              v-for="chat in waitingAnswerChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Входящие чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_my_chats, 'flex-list': true, 'overflow-h-hiddne': button_my_chats}">
    <div class="chat-group-button-box">
      <Button ref="button_my_chats" class="chat-group-button w-full" @click="ClicOnButtonInListMyChats" >Ваши чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_my_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="myChats.length">
            <template 
              v-for="chat in myChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                :count_unredeble_messgaes="chat.count_unredeble_messgaes"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Ваши чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
  <div :class="{'flex-scale':button_other_chats, 'flex-list': true, 'overflow-h-hiddne': button_other_chats}">
    <div class="chat-group-button-box">
      <Button ref="button_other_chats" class="chat-group-button w-full" @click="ClicOnButtonInListOtherChats" >Остальные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_other_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="otherChats.length">
            <template 
              v-for="chat in otherChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center w-full">
              <p class="chat-list-empty-text" >Остальные чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>

  <div :class="{'flex-scale':button_archive_chats, 'flex-list': true, 'overflow-h-hiddne': button_archive_chats}">
    <div class="chat-group-button-box">
      <Button ref="button_archive_chats" class="chat-group-button w-full" @click="ClicOnButtonInListArchiveChats" >Архивные чаты</button>
    </div>
    <div class="chat-group-inner-box overflow-h-hiddne flex-list flex-scale">
      <ScrollPanel class="chat-list overflow-h-hiddne overflow-w-hiddne" v-if="button_archive_chats" step="20">
        <template v-if="chats.loaded">
          <template v-if="archiveChats.length">
            <template 
              v-for="chat in archiveChats"
              :key="chat.id" 
            >
              <ChatAvatarComponent
                :chat="chat"
                :is_iselected="chats.curentChat && chat.id == chats.curentChat.id"
                :platforms="platforms"
                @select-chat="(chat)=>{this.$emit('select-user-chat', chat)}"
              />
            </template>
          </template>
          <template v-else>
            <il class="chat-item flex-list-w align-items-center">
              <p class="chat-list-empty-text" >Архивные чаты отсутствуют</p>
            </il>
          </template>
        </template>
        <template v-else>
          <ChatAvatarSceletonComponent v-for="i in 20" :key="i"/>
        </template>
      </ScrollPanel>
    </div>
  </div>
</template>

<script>
  import Button from 'primevue/button';
  import ScrollPanel from 'primevue/scrollpanel';
  import ChatAvatarComponent from './ChatAvatarComponent.vue';
  import ChatAvatarSceletonComponent from './ChatAvatarSceletonComponent.vue';

  import { addTutorialStep, updateTutorialStepTargetFunc } from '@/tutorial/tutorialPlugin';
  import tutorialTextComponent from '../tutorial/tutorialTextComponent.vue';
  import {useTemplateRef} from 'vue';

  addTutorialStep("awaiting-chats-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tВ данной вкладке предствалены чаты, в ктороых прользователи ожидают ответа от представителей организации. \n\tВ эту вкладку поподают чаты если клиент впервые обратился в организацию или чат был убран в архив, а затем клиент в него написал.",
        button: true,
      },

      reload_events: new Set(["open-awaiting-chats","open-my-chats","open-other-chats","open-archive-chats"]),

      next_step: "my-chats-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("my-chats-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tВ данной вкладке предствалены ваши чаты.",
        button: true,
      },

      reload_events: new Set(["open-awaiting-chats","open-my-chats","open-other-chats","open-archive-chats"]),

      next_step: "other-chats-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("other-chats-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tВ данной вкладке предствалены чужие чаты.",
        button: true,
      },

      reload_events: new Set(["open-awaiting-chats","open-my-chats","open-other-chats","open-archive-chats"]),

      next_step: "archive-chats-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );
  addTutorialStep("archive-chats-info",
    {
      type: "popover",
      watch_ms_to_call_get_target_func:0,
      get_target_func: null,

      slot: tutorialTextComponent,
      props:{
        text: "\tВ данной вкладке предствалены чаты убранные в архив.\n\n\tДля продолжения перейдите в любой доступный чат.",
        button: true,
      },

      reload_events: new Set(["open-awaiting-chats","open-my-chats","open-other-chats","open-archive-chats"]),

      next_step: "dialog-submit-form-info",
      next_step_events: new Set(["next-button"]),

      back_step: null,
      back_step_events: new Set([]),
    }
  );

  export default {
    props: ["chats","search_name", "platforms"],
    components:{
      Button,
      ScrollPanel,
      ChatAvatarComponent,
      ChatAvatarSceletonComponent,
    },

    setup(){
      const button_waiting_chats = useTemplateRef('button_waiting_chats');
      updateTutorialStepTargetFunc("awaiting-chats-info", ()=>{
        return button_waiting_chats;
      });

      const button_my_chats = useTemplateRef('button_my_chats');
      updateTutorialStepTargetFunc("my-chats-info", ()=>{
        return button_my_chats;
      });

      const button_other_chats = useTemplateRef('button_other_chats');
      updateTutorialStepTargetFunc("other-chats-info", ()=>{
        return button_other_chats;
      });

      const button_archive_chats = useTemplateRef('button_archive_chats');
      updateTutorialStepTargetFunc("archive-chats-info", ()=>{
        return button_archive_chats;
      });
    },

    methods:{
      ClicOnButtonInListWaitingChats() {
        this.button_waiting_chats = true;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = false;
        this.$tutorial.emit_event("open-awaiting-chats");
      },
      ClicOnButtonInListMyChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = true;
        this.button_other_chats = false;
        this.button_archive_chats = false;
        this.$tutorial.emit_event("open-my-chats");
      },
      ClicOnButtonInListOtherChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = true;
        this.button_archive_chats = false;
        this.$tutorial.emit_event("open-other-chats");
      },
      ClicOnButtonInListArchiveChats() {
        this.button_waiting_chats = false;
        this.button_my_chats = false;
        this.button_other_chats = false;
        this.button_archive_chats = true;
        this.$tutorial.emit_event("open-archive-chats");
      },
    },
    data() {
      return {
        button_waiting_chats: true,
        button_my_chats: false,
        button_other_chats: false,
        button_archive_chats: false,
      };
    },

    computed: {
      waitingAnswerChats() {
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (element.is_waiting_answer && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      myChats() {
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (!element.is_waiting_answer && !element.is_archive && !element.is_not_connected && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      otherChats(){
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (!element.is_waiting_answer && !element.is_archive && element.is_not_connected && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },

      archiveChats(){
        let arr = [];
        this.$props.chats.chats.forEach(element => {
          if (element.is_archive && (!this.search_name ||element.name.toLowerCase().includes(this.search_name))){
            arr.push(element);
          }
        });
        return arr;
      },
    }
  };
</script>