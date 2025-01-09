<template>
    <div class="flex-scale flex-list-w  scroll-container overflow-h-hiddne" ref="main">
        <div class="flex-scale flex-list dialog-messges-base overflow-h-auto message-scroll" ref="container" @scroll="()=>{checkVisible(this.generate_id())}">
        <template v-if="this.down_index != null && this.up_index !=null && this.$props.current_chat && this.$props.current_chat.messages">
            <template v-for="(index) in this.down_index-this.up_index+1" 
            :key="current_chat.messages[this.up_index+index-1].id">
                <div
                    :class="{ 
                    'message': true,
                    'flex-list': true,
                    'message-self': current_chat.messages[this.up_index+index-1].sender_id == this.this_user_id, 
                    'message-other': current_chat.messages[this.up_index+index-1].sender_id !== this.this_user_id,
                    'max-mode': this.max_mode
                    }"
                    :ref="`item-${this.up_index+index-1}`"
                >
                    <slot name="message" :message="current_chat.messages[this.up_index+index-1]"></slot>
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
    const log_chek_visible = false;
    const loging = false;
    const buffer_size = 10;
    let global_id = 0;

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
            }
        },
  
        methods: {
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
                        // расширение в верх
                        // const container = this.$refs.container;
                        // const sizeChek = this.$refs.sizeChek;
                        // const previousScrollHeight = sizeChek.scrollHeight;
                        // const previousScrollTop = container.scrollTop;
                        // this.LazyCall (() => {
                        //     const newScrollHeight = sizeChek.scrollHeight;
                        //     const heightDiff = newScrollHeight - previousScrollHeight;
                        //     container.scrollTop = previousScrollTop + heightDiff;
                        //     console.log(previousScrollTop, heightDiff)
                        // });
                        const item_index = tovis.length? tovis[tovis.length-1]+1: this.up_index;
                        const refs = this.$refs[`item-${item_index}`];
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
                            this.updateThumb();
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
                            this.updateThumb();
                        });
                        // this.$nextTick(()=>{
                        //     if (GlobalIndex) this.scrollToElement(GlobalIndex);
                        //     this.checkVisible(GlobalIndex);
                        // });
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
                        // const container = this.$refs.container;
                        // const sizeChek = this.$refs.sizeChek;
                        // const previousScrollHeight = sizeChek.scrollHeight;
                        // const previousScrollTop = container.scrollTop;
                        // this.LazyCall(() => {
                        //     const newScrollHeight = sizeChek.scrollHeight;
                        //     const heightDiff = newScrollHeight - previousScrollHeight;
                        //     container.scrollTop = previousScrollTop + heightDiff;
                        // });
                        const item_index = tovis.length? tovis[tovis.length-1]+1: this.up_index;
                        const refs = this.$refs[`item-${item_index}`];
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
                            this.updateThumb();
                        });
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
                        this.down_index += down_count;
                        this.LazyCall (()=>{
                            this.checkVisible(id);
                            this.updateThumb();
                        });
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
                let temp = this.$refs[`item-${index}`];
                if(temp){
                    const element = temp[0];
                    if (element) {
                        // Прокручиваем его в область видимости
                        element.scrollIntoView({
                        block: 'end', // Элемент будет выровнен по верхнему краю контейнера
                        });
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

            updateThumb() {
                const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                const thumbHeight = this.$refs.thumb.offsetHeight;
                this.thumbTop = ((scrollbarrHeight-thumbHeight)/this.$props.current_chat.messages.length)*(this.up_index+(this.down_index-this.up_index)/2);
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
                    this.scrollToElement(index);
                }
            },

            onThumbTouchMove(event){
                if (this.isDragging) {
                    const scrollbarrHeight = this.$refs.scrollbar.offsetHeight;
                    const rect = this.$refs.scrollbar.getBoundingClientRect();
                    const clickPosition = event.targetTouches[0].clientY - rect.top;
                    const index = Math.min(Math.round(clickPosition/(scrollbarrHeight/this.$props.current_chat.messages.length)),this.$props.current_chat.messages.length-1);
                    // console.log(index, clickPosition, scrollbarrHeight,event);
                    this.scrollToElement(index);
                }
            },
        },

        mounted() {
            this.$refs.main.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.scrollbar.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.thumb.addEventListener("mouseup", this.onThumbMouseUp);
            this.$refs.main.addEventListener("mouseleave", this.onThumbMouseUp);
            window.addEventListener("mousemove", this.onThumbMouseMove);

            this.$refs.main.addEventListener("touchend", this.onThumbMouseUp);
            this.$refs.scrollbar.addEventListener("touchend", this.onThumbMouseUp);
            this.$refs.thumb.addEventListener("touchend", this.onThumbMouseUp);
            window.addEventListener("touchmove", this.onThumbTouchMove);

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

            this.$refs.main.removeEventListener("touchend", this.onThumbMouseUp);
            this.$refs.scrollbar.removeEventListener("touchend", this.onThumbMouseUp);
            this.$refs.thumb.removeEventListener("touchend", this.onThumbMouseUp);
            window.removeEventListener("touchmove", this.onThumbTouchMove);

            this.observer.unobserve(this.$refs.container);
        },
  
        watch:{
            "current_chat":{
                handler(newValue, oldValue){
                    console.log(newValue, oldValue);
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
                                if (this.lastFistMessageId && newValue.messages[0].id!=this.lastFistMessageId){
                                    let newIndex = newValue.messages.findIndex((item)=>item.id == this.lastFistMessageId);
                                    this.down_index+=newIndex;
                                    this.up_index+=newIndex;
                                    // this.setLastItem(this.down_index+newIndex-buffer_size);
                                    
                                    this.LazyCall (()=>{
                                        this.checkVisible(this.generate_id());
                                    });
                                } 
                                else{
                                    if (this.up_index == null && this.down_index == null) this.setLastItem(newValue.messages.length-1);
                                }
                            }
                            else{
                                this.up_index = null;
                                this.down_index = null;                                
                            }
                        }
                        if (newValue.messages.length) this.lastFistMessageId = newValue.messages[0].id;
                        else this.lastFistMessageId = null;
                        this.lastChatId = newValue.id;
                    }
                    else{
                        this.lastChatId = null;
                        this.lastFistMessageId = null;
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