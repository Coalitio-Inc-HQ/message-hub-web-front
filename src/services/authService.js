// src/services/authService.js

import axios from 'axios';
import router from "@/router";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const AUTH_REGISTER_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_REGISTER_URL}`;
const AUTH_LOGIN_URL = `${API_BASE_URL}${process.env.VUE_APP_AUTH_LOGIN_URL}`;

export async function register_user(register_data, set_cookie, request_login) {
  axios.post(AUTH_REGISTER_URL, {
    name: register_data.username_reg,
    email: register_data.email_reg,
    password: register_data.password_reg
  })
  .then(function (response) {
    if (response.status === 201) {
      localStorage.already_registered = true;
      request_login(register_data.email_reg, register_data.password_reg, set_cookie);
    }
  })
  .catch(function (error) {
    console.log(error);
    alert("Что-то пошло не так. Попробуйте ещё раз.");
  });
}

export async function login_user(email, password, set_cookie) {
  axios.post(AUTH_LOGIN_URL, {
    username: email,
    password: password
  }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  })
  .then(function (response) {
    if (response.status >= 200 && response.status < 300) {
      if (response.data.access_token) {
        set_cookie("token", response.data.access_token, 1);
        router.push('/chat');
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    alert("Неправильный логин или пароль. Пожалуйста, повторите попытку.");
  });
}

export function request_login(email, password, set_cookie) {
  login_user(email, password, set_cookie);
}
