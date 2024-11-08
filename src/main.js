import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
// import { presets } from 'babel.config';

const app = createApp(App);

app.use(router);


const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        second: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '{slate.800}',
            900: '{slate.900}',
            950: '{slate.950}'
        },
        "heder-font-size":'2rem',
        "text-font-size":'1rem',


        colorScheme:{
            light:{
                "background-color":'{second.300}',
                "second-background-color":'{second.50}',
                "border-color":'{second.500}',
                "highlight-color":'{second.500}',
                "button-color":'{second.800}',
                "button-hover-color":'{second.500}',
                "content-background":'{second.300}',
                "splitter-gutter-background":'{second.500}',

                "heder-font-color":'{second.700}',

                "text-font-color":'{second.700}',
                "text-font-highlight-color":'{second.50}',

                "button-text-color":'{second.50}',
                "button-highlight-text-color":'{second.50}',
            },
            dark:{
                "background-color":'{second.600}',
                "panel-background-color":'{second.500}',
                "second-background-color":'{second.50}',
                "border-color":'{second.500}',
                "highlight-color":'{second.500}',
                "button-color":'{second.800}',
                "button-hover-color":'{second.500}',
                "content-background":'{second.600}',
                "splitter-gutter-background":'{second.500}',

                "heder-font-color":'{second.700}',

                "text-font-color":'{second.700}',
                "text-font-highlight-color":'{second.50}',

                "button-text-color":'{second.50}',
                "button-highlight-text-color":'{second.50}',
            }
        }
    }
});
console.log(MyPreset)
app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        // preset: Aura,
        preset: MyPreset,
        options: {
            prefix: 'p',
            // darkModeSelector: 'system',
            darkModeSelector: '.my-app-dark',
            cssLayer: false
        }
    }
 });

app.mount('#app');

document.documentElement.classList.toggle('my-app-dark');