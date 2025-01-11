<template>
    <div class="flex-scale flex-list-w  scroll-container overflow-h-hiddne" ref="main">
        <div class="flex-scale flex-list dialog-messges-base overflow-h-auto message-scroll" ref="container" @scroll="()=>{checkVisible(this.generate_id())}">
        <template v-if="this.down_index != null && this.up_index !=null && this.$props.current_chat && this.$props.current_chat.messages">
            <template v-for="(index) in this.down_index-this.up_index+1" 
            :key="this.$props.current_chat.messages[this.up_index+index-1].id">
                <div v-if="index==1 || this.$props.current_chat.messages[this.up_index+index-1].sended_at.getDate()!=this.$props.current_chat.messages[this.up_index+index-2].sended_at.getDate()"  class="dialog-date-container">
                    <div class="dialog-date" > {{ format_date_for_display(this.$props.current_chat.messages[this.up_index+index-1].sended_at) }} </div>
                </div>
                <div
                    :class="{ 
                    'message': true,
                    'flex-list': true,
                    'message-self': this.$props.current_chat.messages[this.up_index+index-1].sender_id == this.this_user_id, 
                    'message-other': this.$props.current_chat.messages[this.up_index+index-1].sender_id !== this.this_user_id,
                    'max-mode': this.max_mode
                    }"
                    :ref="`item-${this.up_index+index-1}`"
                >
                    <slot name="message" :message="this.$props.current_chat.messages[this.up_index+index-1]"></slot>
                </div>
            </template>
        </template>
        </div>
        <div class="scroll-container-scrollbar" ref="scrollbar">
            <div
                ref="thumb"
                class="scroll-container-thumb"
                @mousedown.stop.prevent="onThumbMouseDown"
                @touchstart.stop.prevent="onThumbMouseDown"
                :style="thumbStyle"
            />
        </div>
    </div>
</template>
  
<script>
    import {format_date_for_display} from '@/services/dateUtils';
    const log_chek_visible = false;
    const loging = false;
    const buffer_size = 10;
    let global_id = 0;
    let mouseMoveTimeout = setTimeout(() => {}, 0);

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
                up_index: null,
                down_index: null,
                thumbTop: 10,
                thumbHeight: 10,
            }
        },
  
        methods: {
            format_date_for_display,

            generate_id(){
                global_id+=1;
                return global_id;
            },

            setLastItem(index) {
                if (this.$props.current_chat.messages[index]){
                    this.up_index = index;
                    this.down_index = index;

                    // this.$nextTick(()=>{this.checkVisible(index);});
                    this.LazyCall (()=>{this.checkVisible(this.generate_id(), index);});
                }
            },

            checkVisible(id, GlobalIndex = null) {
                if (id != global_id) return;
                if (loging) console.log(this.up_index,this.down_index);

                const container = this.$refs.container;

                let vis = false;
                let tovis = [];
                let postvis = [];
                let fist_vis = null;
                let last_vis = null;
                // Проходим по всем элементам и проверяем их видимость
                for (let i=this.up_index; i<=this.down_index;i++){
                    const temp = this.$refs[`item-${i}`];
                    if (temp){
                        const element = temp[0]; // Массив рефов
                        if (element){
                            const rect = element.getBoundingClientRect();

                            // const containerRect = container.getBoundingClientRect();
                            // Проверяем, виден ли элемент
                            const isVisible = (rect.top >= 0 && rect.top <= container.clientHeight) || (rect.bottom >= 0 && rect.bottom <= container.clientHeight) || rect.top <= 0 && rect.bottom >= container.clientHeight;

                            if (isVisible) {
                                if (log_chek_visible) console.log(`Элемент ${i} ${this.visible_items[i]} видим`);

                                if (!vis) fist_vis = i;
                                last_vis = i;
                                vis = true;
                            } 
                            else {
                                if (vis) {
                                    postvis.push(i);
                                } 
                                else {
                                    tovis.push(i);
                                }
                            }
                        }
                    }
                }
                this.$emit("set-last-viseble-message", this.$props.current_chat, last_vis);

                if (loging) console.log(tovis,postvis);
                if (postvis.length>buffer_size) {
                    this.down_index = this.down_index - (postvis.length-buffer_size);
                } 
                if (tovis.length>buffer_size) {
                    this.up_index = this.up_index + (tovis.length-buffer_size);
                }

                let up = tovis.length<buffer_size;
                let down = postvis.length<buffer_size;

                let can_up = this.up_index>0;
                let up_count = Math.max(Math.min(buffer_size,buffer_size-tovis.length, this.up_index),0);
                let can_down = this.down_index<this.$props.current_chat.messages.length-1;
                let down_count = Math.max(Math.min(buffer_size, buffer_size-postvis.length, this.$props.current_chat.messages.length-1-this.down_index),0);

                if (up&&down){
                    if (can_up){
                        // const item_index = tovis.length? tovis[tovis.length-1]+1: this.up_index;
                        const refs = this.$refs[`item-${last_vis}`];
                        if (refs){
                            const item = refs[0];
                            const old_recrt = item.getBoundingClientRect();
                            this.LazyCall (() => {
                                const new_recrt = item.getBoundingClientRect();
                                const heightDiff = new_recrt.top - old_recrt.top;
                                container.scrollTop += heightDiff;
                            });
                        }

                        this.up_index -= up_count;
                        this.LazyCall (()=>{
                            if (GlobalIndex) this.scrollToElement(GlobalIndex);
                            this.checkVisible(id, GlobalIndex);
                            this.updateThumb(fist_vis, last_vis);
                        });
                        // this.$nextTick(()=>{
                        //     if (GlobalIndex) this.scrollToElement(GlobalIndex);
                        //     this.checkVisible(GlobalIndex);
                        // });
                        return;
                    } else if (can_down){
                        // расширение в в низ
                        this.down_index += down_count;
                        this.LazyCall (()=>{
                            if (GlobalIndex) this.scrollToElement(GlobalIndex);
                            this.checkVisible(id, GlobalIndex);
                            this.updateThumb(fist_vis, last_vis);
                        });
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.updateThumb(fist_vis, last_vis);
                        this.$emit('scrollde-to-top',this.$props.current_chat);
                        this.$emit('scrollde-to-down',this.$props.current_chat);
                        return;
                    }
                }
                if (up){
                    if (can_up){
                        // const item_index = tovis.length? tovis[tovis.length-1]+1: this.up_index;
                        const refs = this.$refs[`item-${last_vis}`];
                        if (refs){
                            const item = refs[0];
                            const old_recrt = item.getBoundingClientRect();
                            this.LazyCall (() => {
                                const new_recrt = item.getBoundingClientRect();
                                const heightDiff = new_recrt.top - old_recrt.top;
                                container.scrollTop += heightDiff;
                            });
                        }

                        this.up_index -= up_count;
                        this.LazyCall (()=>{
                            this.checkVisible(id);
                            this.updateThumb(fist_vis, last_vis);
                        });
                        // this.checkVisible();
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.updateThumb(fist_vis, last_vis);
                        this.$emit('scrollde-to-top',this.$props.current_chat);
                        return;
                    }
                }
                if (down){
                    if (can_down){
                        // расширение в в низ
                        this.down_index += down_count;
                        this.LazyCall (()=>{
                            this.checkVisible(id);
                            this.updateThumb(fist_vis, last_vis);
                        });
                        // this.checkVisible();
                        return;
                    } else{
                        // невозможно расширение недостаточная длинна массива
                        this.updateThumb(fist_vis, last_vis);
                        this.$emit('scrollde-to-down',this.$props.current_chat);
                        return;
                    }
                }
            },

            scrollToElement(index, animate = false) {
                let temp = this.$refs[`item-${index}`];
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
                // Получаем элемент по его рефу
                
            },

            onResize(){
                if (this.$props.current_chat && this.$props.current_chat.messages.length) this.setLastItem();
            },

            LazyCall(func){
                // setTimeout(() => {
                    this.$nextTick(func);
                // }, 50);
            },

            updateThumb(up_index, down_index) {
                // const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                // const thumbHeight = this.$refs.thumb.offsetHeight;
                // this.thumbTop = ((scrollbarrHeight-thumbHeight)/this.$props.current_chat.messages.length)*(this.down_index+this.up_index)/2;

                // const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                // const heightPerIndex = scrollbarrHeight/this.$props.current_chat.messages.length;
                // this.thumbHeight = (this.down_index-this.up_index+1)* heightPerIndex;
                // this.thumbTop = (scrollbarrHeight-this.thumbHeight)/this.$props.current_chat.messages.length*(this.down_index+this.up_index)/2;

                const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                const visible_items = down_index - up_index+1;
                const relative_start = up_index / this.$props.current_chat.messages.length;
                const relative_length = visible_items / this.$props.current_chat.messages.length;

                this.thumbTop = relative_start * scrollbarrHeight;
                this.thumbHeight = relative_length * scrollbarrHeight;

            },

            // onScrollbarMouseDown(event) {
            //     const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
            //     const clickPosition = event.clientY;
            //     const index = Math.round(clickPosition/(scrollbarrHeight/this.$props.current_chat.messages.length));

            //     this.scrollToElement(index);
            // },

            onThumbMouseDown() {
                this.isDragging = true;
                // this.startY = event.clientY;
                // this.startScrollTop = this.$refs.content.scrollTop;
            },

            onThumbMouseUp() {
                this.isDragging = false;
            },

            onThumbMouseMove(event) {
                if (this.isDragging) {
                    console.log(event);
                    // const deltaY = event.clientY - this.startY;
                    // const container = this.$refs.content;
                    // const contentHeight = container.scrollHeight;
                    // const containerHeight = container.offsetHeight;
                    // const scrollRatio = contentHeight / containerHeight;
                    // container.scrollTop = this.startScrollTop + deltaY * scrollRatio;
                    // this.updateThumb();
                    //     const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                    const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                    const clickPosition = event.offsetY;
                    const index = Math.min(Math.round(clickPosition/(scrollbarrHeight/this.$props.current_chat.messages.length)),this.$props.current_chat.messages.length-1);
                    // console.log(index, clickPosition, scrollbarrHeight,event);
                    if (this.up_index<=index &&index <=this.down_index){
                        this.scrollToElement(index, true);
                    }
                    else{
                        this.updateThumb(index,index);
                        clearTimeout(mouseMoveTimeout);
                        mouseMoveTimeout = setTimeout(() => {
                            this.setLastItem(index);
                        }, 500);
                    }
                }
            },

            onThumbTouchMove(event){
                if (this.isDragging) {
                    const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                    const rect = this.$refs.scrollbar.getBoundingClientRect();
                    const clickPosition = event.targetTouches[0].clientY - rect.top;
                    const index = Math.min(Math.round(clickPosition/(scrollbarrHeight/this.$props.current_chat.messages.length)),this.$props.current_chat.messages.length-1);
                    // console.log(index, clickPosition, scrollbarrHeight,event);
                    if (this.up_index<=index &&index <=this.down_index){
                        this.scrollToElement(index, true);
                    }
                    else{
                        this.updateThumb(index,index);
                        clearTimeout(mouseMoveTimeout);
                        mouseMoveTimeout = setTimeout(() => {
                            this.setLastItem(index);
                        }, 500);
                    }
                }
            },
        },

        mounted() {
            this.$refs.main.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.scrollbar.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.thumb.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.main.addEventListener("mouseleave", this.onThumbMouseUp);
            window.addEventListener("mousemove", this.onThumbMouseMove);
            this.$refs.thumb.addEventListener("mousemove", this.onThumbMouseMove);

            this.$refs.main.addEventListener("touchend", this.onThumbMouseUp);
            this.$refs.scrollbar.addEventListener("touchend", this.onThumbMouseUp);
            this.$refs.thumb.addEventListener("touchend", this.onThumbMouseUp);
            window.addEventListener("touchmove", this.onThumbTouchMove);
            this.$refs.thumb.addEventListener("touchmove", this.onThumbTouchMove);

            this.observer = new ResizeObserver(this.onResize);
            this.observer.observe(this.$refs.container);

            if (this.$props.current_chat && this.$props.current_chat.messages.length) this.setLastItem(this.$props.current_chat.messages.length-1);
        },

        beforeUnmount () {
            this.$refs.main.removeEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.scrollbar.removeEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.thumb.removeEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.main.removeEventListener("mouseleave", this.onThumbMouseUp);
            window.removeEventListener("mousemove", this.onThumbMouseMove);
            this.$refs.thumb.removeEventListener("mousemove", this.onThumbMouseMove);

            this.$refs.main.removeEventListener("touchend", this.onThumbMouseUp);
            this.$refs.scrollbar.removeEventListener("touchend", this.onThumbMouseUp);
            this.$refs.thumb.removeEventListener("touchend", this.onThumbMouseUp);
            window.removeEventListener("touchmove", this.onThumbTouchMove);
            this.$refs.thumb.removeEventListener("touchmove", this.onThumbTouchMove);

            this.observer.unobserve(this.$refs.container);
        },
  
        watch:{
            "current_chat":{
                handler(newValue, oldValue){
                    console.log("current_chat",newValue, oldValue);
                    if (newValue) console.log("current_chat",newValue.messages);
                    if (newValue && newValue.messages) console.log("current_chat",newValue.messages[0]);
                    if (newValue){
                        if (newValue.id != this.lastChatId){
                            if(newValue.messages.length){
                                this.setLastItem(newValue.messages.length-1);
                            } else{
                                this.up_index = null;
                                this.down_index = null;
                            }
                        } 
                        else{
                            if (newValue.messages.length){
                                if (this.lastFistMessage && newValue.messages[0].id!=this.lastFistMessage.id){
                                    let newIndex = newValue.messages.findIndex((item)=>item.id == this.lastFistMessage.id);
                                    this.down_index+=newIndex;
                                    this.up_index+=newIndex;
                                    // this.setLastItem(this.down_index+newIndex-buffer_size);
                                    
                                    this.LazyCall (()=>{
                                        this.checkVisible(this.generate_id());
                                    });
                                } 
                                else{
                                    if (this.up_index == null && this.down_index == null) this.setLastItem(newValue.messages.length-1);
                                    if (newValue.messages.length!= this.lastMessagesLength){
                                        this.LazyCall (()=>{
                                            this.checkVisible(this.generate_id());
                                        });
                                    }
                                }
                            }
                            else{
                                this.up_index = null;
                                this.down_index = null;                                
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
                        this.up_index = null;
                        this.down_index = null;   
                    }
                },
                immediate: true,
                deep: true,
            },
        },

        computed: {
            thumbStyle() {
                return {
                    top: `${this.thumbTop}px`,
                    height: `${this.thumbHeight}px`,
                };
            },
        },
    };
  </script>
  
  <style scoped>
  @import '@/assets/ChatComponent.css'; 
  @import '@/assets/VirtualScroll.css'; 
  @import 'primeicons/primeicons.css';
  @import '@/assets/Layout.css';
  </style>