const loging = true;

import { 
  // h, 
  // render, 
  reactive,
  createApp,
} from 'vue';

import PrimeVue from 'primevue/config';

import tutorialComponent from './tutorialComponent.vue';

const data = reactive({
  steps: {
    // start:{
    //   type: "popover" | "dialog", // тип диалог с боку или по середине экрана
    //   watch_ms_to_call_get_target_func: 0
    //   get_target_func: ref, // цель, если диолог относительно элемента

    //   slot
    //   props

    //   reload_events:Set([""]), // В случае popover иногда нужно менть положение

    //   next_step:"", // Название следующего шага
    //   next_step_events: Set([""]), // События перехода на следующий шаг

    //   back_step:"", // Название предидущего шага
    //   back_step_events: Set([""]),// События перехода на предидущий шаг
    // }
  },
  this_step: null,
})

let close_tuturial_event_handlers = []
let end_tuturial_event_handlers = []
let tutorial_component = null;

export const tutorialPlugin = {
  install(app) {
    const appInstance = createApp(tutorialComponent, {"data":data});
    appInstance.use(PrimeVue);
    tutorial_component = appInstance.mount(document.createElement('div'));
    document.body.appendChild(appInstance._container);

    let global_prop = {
      emit_event: function(name){
        if (loging) console.log(`[tutorial] произошло собтие: ${name}`)

        if (name == "close-tutorial"){
          close_tuturial_event_handlers.forEach((fun)=>{fun();});
          data.this_step=null;
          return;
        }
        
        if (data.this_step){
          if (data.steps[data.this_step]){
            if (data.steps[data.this_step].next_step_events.has(name)){
              if (data.steps[data.this_step].next_step===null){
                end_tuturial_event_handlers.forEach((fun)=>{fun();});
              } 
              data.this_step=data.steps[data.this_step].next_step;

            } else{
              if (data.steps[data.this_step].reload_events && data.steps[data.this_step].reload_events.has(name)){
                if (tutorial_component){
                  tutorial_component.reloadPopover();
                }
              }
              else if (data.steps[data.this_step].back_step_events.has(name)){
                data.this_step=data.steps[data.this_step].back_step;
              }
            }
          }
        }
      },

      add_close_tuturial_event_handler: function(fun){
        close_tuturial_event_handlers.push(fun)
      },

      add_end_tuturial_event_handlers: function(fun){
        end_tuturial_event_handlers.push(fun)
      },
    };

    app.config.globalProperties.$tutorial=global_prop;
    appInstance.config.globalProperties.$tutorial=global_prop;
  }
}

export function addTutorialStep(name, step){
  if (name in data.steps){
    throw `Этап ${name} уже существует.`;
  }
  data.steps[name] = step;
}

export function updateTutorialStepTargetFunc(name, get_target_func){
  if (!(name in data.steps)){
    throw `Этап ${name} не существует.`;
  }
  data.steps[name].get_target_func = get_target_func;
}

export function setTutorialStep(name){
  if (!(name in data.steps) || name == null){
    throw `Этапа ${name} не существует.`;
  }

  data.this_step = name;
}


export function addCloseTuturialEventHandlers(fun){
  close_tuturial_event_handlers.push(fun)
}

export function addEndTuturialEventHandlers(fun){
  end_tuturial_event_handlers.push(fun)
}