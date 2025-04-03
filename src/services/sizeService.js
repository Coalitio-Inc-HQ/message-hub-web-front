import { defineStore } from 'pinia'
import { ref, onScopeDispose } from 'vue';

const minWindowConst = 768;

export const useSizeService = defineStore('SizeService',()=>{
    let minWindow_let = window.innerWidth <= minWindowConst;
    const minWindow = ref(minWindow_let);

    const updateWidth = ()=>{
        if (minWindow_let != window.innerWidth <= minWindowConst){
            minWindow_let = !minWindow_let;
            minWindow.value = minWindow_let;
        }
    }

    window.addEventListener('resize', updateWidth);
    
    onScopeDispose(() => {
        window.removeEventListener('resize', updateWidth);
    });
    

    return {
        minWindow
    }
})