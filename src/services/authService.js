import axios from 'axios';
import { defineStore } from 'pinia'
import { deleteCookies, getCookie, setCookie } from '@/utilities/cookie';
import router from '@/router';
import { ref } from 'vue';


const loging = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_LOGIN_URL = `${API_BASE_URL}${import.meta.env.VITE_AUTH_LOGIN_URL}`;
const VITE_USER_INFO_URL = `${API_BASE_URL}${import.meta.env.VITE_USER_INFO_URL}`;
const VITE_USER_SET_SETTINGS_URL = `${API_BASE_URL}${import.meta.env.VITE_USER_SET_SETTINGS_URL}`;
const USER_PASSWORD_CHENGE_EXECUTE_URL = API_BASE_URL + import.meta.env.VITE_USER_PASSWORD_CHENGE_EXECUTE_URL;
// const AUTH_REGISTER_URL = `${API_BASE_URL}${VITE_AUTH_REGISTER_URL}`;

export const failAuthFuncBracers = [
];

export const useAuthService = defineStore('AuthService',()=>{

  const token = ref(getCookie("token"));// Токен аутентификацуии
  const userInfo = ref(null); // Текущий пользователь
  const failAuthFunc = ref(()=>{ // функция вызываемая при ошибке аутентификации
    for(const i in failAuthFuncBracers){
      if (failAuthFuncBracers[i]){
        return;
      }
    }
    router.push('/login');
  });

  // Получение сведений о пользователе и проверка валидности токена
  if (token.value){
    axios.post(VITE_USER_INFO_URL, {"token": token.value}).then((response)=>{
      if (loging) console.log('Проверка токена успешна', response.data);
      userInfo.value = response.data;
    }).catch((error)=>{
      if (loging) console.log('Ошибка проверки токена', error);
      if ("response" in error && error.response.status === 401){
        failAuthFunc.value();
        return;
      }
    })
  } else{
    failAuthFunc.value();
  }

  const login = async (email, password)=>{
    try{
      const response = await axios.post(
        AUTH_LOGIN_URL,
        {
          email: email,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (loging) console.log('Вход успешен', response.data);
      setCookie("token", response.data.jwt, 1);
      token.value = response.data.jwt;
      userInfo.value = response.data.userInfo;
      return true;
    }
    catch(error){
      if (loging) console.log('Непредвиденная ошибка входа:', error);
      if ("response" in error && error.response.status === 401){
        return {
          error: error,
          description: "Введён неправильный логин или пароль",
        };
      }

      return {
        error: error,
        description: "Непредвиденная ошибка входа",
      };
    }
  }


  const set_settings = async (key, value)=>{
    try{
      const response = await axios.post(
        VITE_USER_SET_SETTINGS_URL,
        {
          key: key,
          value: value,
          token: token.value,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (loging) console.log('Настройки установлены успешно', response.data);
      if (userInfo.value.settings){
        userInfo.value.settings[key]=value;
      }
      return response.data;
    }
    catch(error){
      if (loging) console.log('Непредвиденная ошибка установки настроек:', error);
      if ("response" in error && error.response.status === 401){
        return {
          error: error,
          description: "Не валидный токен",
        };
      }

      return {
        error: error,
        description: "Непредвиденная ошибка входа",
      };
    }
  }


  const logOut = ()=>{
    token.value = null;
    userInfo.value = null;
    deleteCookies("token");
    failAuthFunc.value();
  }


  const changePassword = async (ref_token, user_id, password)=>{
    try{
      const response = await axios.post(
        USER_PASSWORD_CHENGE_EXECUTE_URL,
        {
          user_id: user_id,
          token: ref_token,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (loging) console.log('Пароль успешно изменён', response.data);
      setCookie("token", response.data.jwt, 1);
      token.value = response.data.jwt;
      userInfo.value = response.data.userInfo;
      return true;
    }
    catch(error){
      if (loging) console.log('Непредвиденная ошибка смены пароля:', error);
      if ("response" in error && error.response.status === 401){
        return {
          error: error,
          description: "Не валидный токен или срок смены пароля истёк.",
        };
      }

      return {
        error: error,
        description: "Непредвиденная ошибка смены пароля",
      };
    }
  }



  return {
    token, userInfo, failAuthFunc,// state
    login, logOut, set_settings, changePassword,//actions
  }
})