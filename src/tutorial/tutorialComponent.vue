<template>
  <template v-if="data.this_step">
    <template v-if="this_step.type=='dialog'">
      <Dialog v-model:visible="visible" modal>
        <template #container>
          <div class="flex-list tutorial-container-dialog gap">
            <div class="flex-list-w gap align-items-center" >
              <p class="tutorial-heder flex-scale">Руководство пользователя</p>
              <Button class="close-button" icon="pi pi-times" @click="visible=false" variant="text" />
            </div>
            <div class="flex-scale">
              <component :is="this_step.slot" v-bind="this_step.props" />
            </div>  
          </div>
        </template>
      </Dialog>
    </template>
    <template v-else>
      <Popover ref="tutorialpopover" :dismissable="false" class="flex-list tutorial-container gap">
        <div class="flex-list tutorial-container-popover gap">
          <div class="flex-list-w gap align-items-center" >
            <p class="tutorial-heder flex-scale">Руководство пользователя</p>
            <Button class="close-button" icon="pi pi-times" @click="visible=false" variant="text" />
          </div>
          <div class="flex-scale">
            <component :is="this_step.slot" v-bind="this_step.props" />
          </div>  
        </div>
      </Popover>
    </template>
  </template>
</template>

<script>
    import Dialog from 'primevue/dialog';
    import Button from 'primevue/button';
    import Popover from 'primevue/popover';

    export default {
      props: ["data"],
      components:{
        Dialog,
        Button,
        Popover,
      },
      
      data(){
        return{
          visible:false,
        }
      },

      watch: { 
        'visible': {
          handler(newValue) {
            if (!newValue && this.$tutorial){
              this.$tutorial.emit_event("close-tutorial");
            }
          },
          deep: false,
          immediate: true
        },

        'data.this_step':{
          handler(newValue, oldValue) {
            if (newValue != oldValue && newValue){
              if (this.this_step.type==="popover"){
                setTimeout(() => {
                  this.$refs.tutorialpopover.show({ "currentTarget": null }, this.this_step.target.$el);
                }, 0);
              }
            }
          },
          deep: false,
          immediate: true
        }
      },

      mounted(){
        this.$nextTick(()=>{
          this.visible=true;
        })
      },
      computed:{
        this_step(){
          return this.$props.data.steps[this.$props.data.this_step];
        }
      },
    };
  </script>

  <style scoped>
    @import '@/assets/Layout.css';
    @import 'primeicons/primeicons.css';
    @import '@/tutorial/tutorialComponent.css';
  </style>