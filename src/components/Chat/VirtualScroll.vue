<template>
    <div class="flex-scale dialog-messges-base flex-list overflow-h-auto" ref="container" @scroll="checkVisible">
        <div ref="sizeChek">
        <template v-for="(message, index) in this.visible_items" 
        :key="message.sender_id + message.sended_at">
            <div
                :class="{ 
                'message': true,
                'flex-list': true,
                'message-self': message.sender_id == this.this_user_id, 
                'message-other': message.sender_id !== this.this_user_id,
                'max-mode': this.max_mode
                }"
                :ref="`item-${index}`"
            >
                <slot name="message" :message="message"></slot>
            </div>
        </template>
        </div>
    </div>
</template>
  
<script>
    const log_chek_visible = false;

    export default {
        components:{

        },
        props: [
            "current_chat",
            "this_user_id",
            "max_mode",
        ],
  
        data(){
            return{
                visible_items: [],
                up_index: null,
                down_index: null,
            }
        },
  
        methods: {
            // returnToInit(){
            //     this.visible_items = [];
            //     this.up_index = null;
            //     this.down_index = null;
            // },

            setLastItem(index) {
                this.up_index = index;
                this.down_index = index;
                this.visible_items = [this.$props.current_chat.messages[index]];

                this.$nextTick(this.checkVisible);
            },

            checkVisible() {
                console.log(this.up_index,this.down_index);

                const container = this.$refs.container;

                let vis = false;
                let tovis = [];
                let postvis = [];
                // Проходим по всем элементам и проверяем их видимость
                this.visible_items.forEach((item, index) => {
                    const element = this.$refs[`item-${index}`][0]; // Массив рефов
                    const rect = element.getBoundingClientRect();

                    // const containerRect = container.getBoundingClientRect();
                    // Проверяем, виден ли элемент
                    const isVisible = (rect.top >= 0 && rect.top <= container.clientHeight) || (rect.bottom >= 0 && rect.bottom <= container.clientHeight) || rect.top <= 0 && rect.bottom >= container.clientHeight;

                    if (isVisible) {
                        if (log_chek_visible) console.log(`Элемент ${index} ${this.visible_items[index]} видим`);
                        vis = true;
                    } 
                    else {
                        if (vis) {
                            postvis.push(index);
                            console.log(index);
                        } 
                        else {
                            tovis.push(index);
                            console.log(index, rect);
                        }
                    }
                });
                console.log(tovis,postvis);
                if (postvis.length>1) {
                    this.visible_items.splice(postvis[1],postvis.length-1);
                    this.down_index = this.down_index - postvis.length+1;
                } 
                if (tovis.length>1) {
                    this.visible_items.splice(0, tovis.length-1);
                    this.up_index = this.up_index + tovis.length-1;
                }

                let up = tovis.length==0;
                let down = postvis.length==0;

                let can_up = this.up_index>0;
                let can_down = this.down_index<this.$props.current_chat.messages.length-1;

                if (up&&down){
                    if (can_up){
                        // расширение в верх
                        const container = this.$refs.container;
                        const sizeChek = this.$refs.sizeChek;
                        const previousScrollHeight = sizeChek.scrollHeight;
                        const previousScrollTop = container.scrollTop;
                        requestAnimationFrame (() => {
                            const newScrollHeight = sizeChek.scrollHeight;
                            const heightDiff = newScrollHeight - previousScrollHeight;
                            container.scrollTop = previousScrollTop + heightDiff;
                            console.log(previousScrollTop, heightDiff)
                        });

                        this.visible_items.unshift(this.$props.current_chat.messages[this.up_index - 1]);
                        this.up_index -= 1;
                        this.$nextTick(this.checkVisible);
                        return;
                    } else if (can_down){
                        // расширение в в низ
                        this.visible_items.push(this.$props.current_chat.messages[this.down_index + 1]);
                        this.down_index += 1;
                        this.$nextTick(this.checkVisible);
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.$emit('scrollde-to-top',this.$props.current_chat);
                        this.$emit('scrollde-to-down',this.$props.current_chat);
                        return;
                    }
                }
                if (up){
                    if (can_up){
                        // расширение в верх
                        const container = this.$refs.container;
                        const sizeChek = this.$refs.sizeChek;
                        const previousScrollHeight = sizeChek.scrollHeight;
                        const previousScrollTop = container.scrollTop;
                        requestAnimationFrame(() => {
                            const newScrollHeight = sizeChek.scrollHeight;
                            const heightDiff = newScrollHeight - previousScrollHeight;
                            container.scrollTop = previousScrollTop + heightDiff;
                        });

                        this.visible_items.unshift(this.$props.current_chat.messages[this.up_index - 1]);
                        this.up_index -= 1;
                        // this.checkVisible();
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.$emit('scrollde-to-top',this.$props.current_chat);
                        return;
                    }
                }
                if (down){
                    if (can_down){
                        // расширение в в низ
                        this.visible_items.push(this.$props.current_chat.messages[this.down_index + 1]);
                        this.down_index += 1;
                        // this.checkVisible();
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.$emit('scrollde-to-down',this.$props.current_chat);
                        return;
                    }
                }
            },

            scrollToElement(index) {
                let local_index = index - this.up_index;
                // Получаем элемент по его рефу
                const element = this.$refs[`item-${local_index}`][0];
                
                if (element) {
                    // Прокручиваем его в область видимости
                    element.scrollIntoView({
                    block: 'end', // Элемент будет выровнен по верхнему краю контейнера
                    });
                }
            },
        },

        mounted() {
            if (this.$props.current_chat.messages.length)
            this.setLastItem(this.$props.current_chat.messages.length-1);
        },
  
        watch:{
            "current_chat.messages":{
                handler(newValue, oldValue){
                    if (newValue.length){
                        if(oldValue.length){
                            let newIndex = newValue.findIndex((item)=>item.id == oldValue[0].id);
                            this.setLastItem(this.down_index+newIndex-1);
                        } else{
                            this.setLastItem(newValue.length-1);
                        }
                    }
                },
            },
            "current_chat":{
                handler(newValue, oldValue){
                    if (newValue.id != oldValue.id){
                        if(this.$props.current_chat.messages.length){
                            this.setLastItem(this.$props.current_chat.messages.length-1);
                        } 
                    } 
                },
            },
        },

        beforeUnmount () {

        }
    };
  </script>
  
  <style scoped>
  @import '@/assets/ChatComponent.css'; 
  @import 'primeicons/primeicons.css';
  @import '@/assets/Layout.css';
  </style>