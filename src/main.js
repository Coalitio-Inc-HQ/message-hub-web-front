import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
// import { presets } from 'babel.config';
import { createPinia } from 'pinia'

import ConfirmationService from 'primevue/confirmationservice';

import { tutorialPlugin } from './tutorial/tutorialPlugin';

const app = createApp(App);

app.use(router);
app.use(createPinia())
app.use(tutorialPlugin);

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
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

        surface: {
            50: '{slate.50} !important',
            100: '{slate.100} !important',
            200: '{slate.200} !important',
            300: '{slate.300} !important',
            400: '{slate.400} !important',
            500: '{slate.500} !important',
            600: '{slate.600} !important',
            700: '{slate.700} !important',
            800: '{slate.800} !important',
            900: '{slate.900} !important',
            950: '{slate.950} !important'
        },


        "heder-font-size":'2rem',
        "text-font-size":'1rem',

        colorScheme:{
            light:{
                "background-color":'{primary.300}',
                "second-background-color":'{primary.50}',
                "border-color":'{primary.500}',
                "highlight-color":'{primary.500}',
                "button-color":'{primary.800}',
                "button-hover-color":'{primary.500}',
                "content-background":'{primary.300}',
                "splitter-gutter-background":'{primary.500}',

                "heder-font-color":'{primary.700}',

                "text-font-color":'{primary.700}',
                "text-font-highlight-color":'{primary.50}',

                "button-text-color":'{primary.50}',
                "button-highlight-text-color":'{primary.50}',
            },
            dark:{
                "background-color":'{primary.700}',
                "second-background-color":'{primary.100}',
                "panel-background-color":'{primary.500}',

                "heder-font-color":'{primary.700}',



                "border-color":'{primary.500}',
                "highlight-color":'{primary.500}',
                "button-color":'{primary.800}',
                "button-hover-color":'{primary.500}',
                "content-background":'{primary.600}',
                "splitter-gutter-background":'{primary.500}',
                "text-font-color":'{primary.700}{primary.700}',
                "text-font-highlight-color":'{primary.50}',

                // "button-text-color":'{primary.50}',
                // "button-highlight-text-color":'{primary.50}',
                
            }
        }
    }
});

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        // preset: Aura,
        preset: MyPreset,
        options: {
            prefix: 'p',
            // darkModeSelector: 'system',
            darkModeSelector: '.dark',
            cssLayer: false
        }
    }
 });

app.use(ConfirmationService)

app.mount('#app');

document.documentElement.classList.toggle('dark');