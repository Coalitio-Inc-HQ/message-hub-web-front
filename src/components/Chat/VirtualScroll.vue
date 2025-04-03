<template>
    <!-- <div class="flex-scale flex-list-w  scroll-container overflow-h-hiddne" ref="main"> -->
        <div class="flex-scale flex-list dialog-messges-base overflow-h-auto" ref="container" @scroll="checkVisible">
            <template v-if="this.$props.current_chat">
                <template v-if="this.$props.current_chat.await_messages && !this.$props.current_chat.messages.length">
                    <div
                        v-for="i in 20"
                        :key="i"
                        :class="{ 
                        'message': true,
                        'flex-list': true,
                        'message-self': false, 
                        'message-other': true,
                        'max-mode': this.max_mode
                        }"
                    >   
                        <Skeleton width="2rem" class="mb-2"></Skeleton>
                        <Skeleton width="10rem" height="4rem"></Skeleton>
                        <Skeleton width="2rem" class="mb-2 message-timestamp"></Skeleton>
                    </div>
                </template>
                <template v-else>
                    <template v-if="this.$props.current_chat.await_messages">
                        <div class="dialog-loading-spiner-container">
                            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"/>
                        </div>
                    </template>
                    <template v-for="(message, index) in this.$props.current_chat.messages" 
                    :key="message.id">
                        <div v-if="(index==0 || message.sended_at.getDate()!=this.$props.current_chat.messages[index-1].sended_at.getDate())&&(findVisibleMessageInthisDate(index)>-1 || show_deleted_messages)"  class="dialog-date-container">
                            <div class="dialog-date" > {{ format_date_for_display(message.sended_at) }} </div>
                        </div>
                        <template v-if="!message.is_hide || show_deleted_messages">
                            <div
                                :class="{ 
                                'message': true,
                                'flex-list': true,
                                'message-self': message.sender_id == this.this_user_id, 
                                'message-other': message.sender_id !== this.this_user_id,
                                'max-mode': this.max_mode
                                }"
                                :ref="`item-${message.id}`"
                                @contextmenu="(e)=> this.$emit('contextmenu-on-message', e, message)"
                                aria-haspopup="true"
                            >
                                <slot name="message" :message="message"></slot>
                            </div>
                        </template>
                    </template>
                    <template v-if="this.$props.current_chat.await_down_messages">
                        <div class="dialog-loading-spiner-container">
                            <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"/>
                        </div>
                    </template>
                </template>
            </template>
        </div>
    <!-- </div> -->
</template>
  
<script>
    import {format_date_for_display} from '@/services/dateUtils';
    import Skeleton from 'primevue/skeleton';

    let last_vis = null;

    export default {
        components:{
            Skeleton,
        },
        props: [
            "current_chat",
            "this_user_id",
            "max_mode",
            "show_deleted_messages",
        ],
        data(){
            return{

            }
        },
  
        methods: {
            format_date_for_display,

            findVisibleMessageInthisDate(start_index){
                let find = -1;
                let start_date = this.$props.current_chat.messages[start_index].sended_at.getDate();
                for (let i = start_index; i<this.$props.current_chat.messages.length; i++){
                    if (this.$props.current_chat.messages[i].sended_at.getDate()==start_date){
                        if (!this.$props.current_chat.messages[i].is_hide){
                            find = i;
                            break;
                        }
                    }else{
                        break;
                    }
                }

                return find;
            },

            checkVisible() {
                if (this.$props.current_chat){
                    const container = this.$refs.container;

                    let vis = false;
                    last_vis = null;

                    for (let i=0; i<this.$props.current_chat.messages.length; i++){
                        const temp = this.$refs[`item-${this.$props.current_chat.messages[i].id}`];
                        if (temp){
                            const element = temp[0];
                            if (element){
                                const rect = element.getBoundingClientRect();

                                const isVisible = (rect.top >= 0 && rect.top <= container.clientHeight) || (rect.bottom >= 0 && rect.bottom <= container.clientHeight) || rect.top <= 0 && rect.bottom >= container.clientHeight;

                                if (isVisible) {
                                    last_vis = i;
                                    vis = true;
                                } 
                                else {
                                    if (vis) {
                                        break;
                                    } 
                                }
                            }
                        }
                    }
                    this.$emit("set-last-viseble-message", this.$props.current_chat, last_vis);

                    if(container.scrollTop==0){
                        this.$emit('scrollde-to-top',this.$props.current_chat);
                    }

                    if (container.scrollTop + container.clientHeight >= container.scrollHeight){
                        this.$emit('scrollde-to-down',this.$props.current_chat);
                    }
                }
            },

            scrollToElement(index, animate = false) {
                let temp = this.$refs[`item-${this.$props.current_chat.messages[index].id}`];
                if(temp){
                    const element = temp[0];
                    if (element) {
                        if (animate){
                            element.scrollIntoView({
                                behavior: "smooth",
                                block: 'end', 
                            });
                        }
                        else{
                            element.scrollIntoView({
                                block: 'end', 
                            });
                        }
                    }
                }
            },

            onResize(){
                this.$nextTick(this.checkVisible);
            },
        },

        mounted() {
            this.observer = new ResizeObserver(this.onResize);
            this.observer.observe(this.$refs.container);
        },

        beforeUnmount () {
            this.observer.unobserve(this.$refs.container);
        },

        // const refs = this.$refs[`item-${last_vis}`];
        // if (refs){
        //     const item = refs[0];
        //     const old_recrt = item.getBoundingClientRect();
        //     this.LazyCall (() => {
        //         const new_recrt = item.getBoundingClientRect();
        //         const heightDiff = new_recrt.top - old_recrt.top;
        //         container.scrollTop += heightDiff;
        //     });
        // }

        watch:{
            "current_chat":{
                handler(newValue){
                    if (newValue){
                        if (newValue.id != this.lastChatId){
                            if(newValue.messages.length){
                                this.$nextTick (() => {
                                    this.scrollToElement(newValue.messages.length-1);
                                });
                            }
                        } 
                        else{
                            if (newValue.messages.length){
                                if (this.lastFistMessage && newValue.messages[0].id!=this.lastFistMessage.id){
                                   
                                    const container = this.$refs.container;
                                    const refs = this.$refs[`item-${this.lastFistMessage.id}`];
                                    if (refs){
                                        const item = refs[0];
                                        const old_recrt = item.getBoundingClientRect();
                                        this.$nextTick (() => {
                                            const new_recrt = item.getBoundingClientRect();
                                            const heightDiff = new_recrt.top - old_recrt.top;
                                            container.scrollTop += heightDiff;
                                        });
                                    }
                                }
                                else if (newValue.messages.length-1 == this.lastMessagesLength && last_vis && last_vis==this.lastMessagesLength-1){
                                    this.$nextTick (() => {
                                        this.scrollToElement(newValue.messages.length-1);
                                    });
                                } else if (newValue.messages.length && !this.lastMessagesLength){
                                    this.$nextTick (() => {
                                        this.scrollToElement(newValue.messages.length-1);
                                    });
                                }
                                
                            }
                        }
                        if (newValue.messages.length) this.lastFistMessage = newValue.messages[0];
                        else this.lastFistMessage = null;
                        if (newValue.messages.length) this.lastMessagesLength = newValue.messages.length;
                        else this.lastMessagesLength = null;
                        this.lastChatId = newValue.id;
                    }
                    else{
                        this.lastChatId = null;
                        this.lastFistMessage = null;
                        this.lastMessagesLength = null;
                    }
                },
                immediate: true,
                deep: true,
            },
        },
        // "show_deleted_messages":{
        //     handler(){
        //         const container = this.$refs.container;
        //         const refs = this.$refs[`item-${this.lastFistMessage.id}`];
        //         if (refs){
        //             const item = refs[0];
        //             const old_recrt = item.getBoundingClientRect();
        //             this.$nextTick (() => {
        //                 const new_recrt = item.getBoundingClientRect();
        //                 const heightDiff = new_recrt.top - old_recrt.top;
        //                 container.scrollTop += heightDiff;
        //             });
        //         }
        //     },
        //     immediate: true,
        //     deep: true,
        // }
    };
  </script>
  
  <style>
    @import '@/assets/ChatComponent.css'; 
    @import '@/assets/VirtualScroll.css'; 
    @import 'primeicons/primeicons.css';
    @import '@/assets/Layout.css';
  </style>