import axios from 'axios';
import {ref} from 'vue';
import { uuidv4 } from '@/utilities/uuid';
import {generateVideoPreview} from "@/utilities/VideoMiniature";

const loging = true;
const max_file_size = 52428800;

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const FILE_UPLOAD_URL = `${API_BASE_URL}${process.env.VUE_APP_FILE_UPLOAD_URL}`;

export function upload_file(file, token) {
  if (file.size>max_file_size) throw "large_file";

  let type = "file";
  if (file.type.startsWith('image/')) type = 'image';
  if (file.type.startsWith('video/')) type = 'video';

  let res = ref({
    id: uuidv4(),
    name: file.name,
    type: type,
    url:URL.createObjectURL(file),
    uploaded_url: null,
    progress: 0,
    uploaded: false,

    miniature: {
        loading: true,
        uploaded: false,
        uploaded_url: null,
        url: null,
    },

    on_upload_progress: null,
    download_call_back: null,
    err_download_call_back: null,
    delete_call: null,
    miniature_call_back: null,
    miniature_download_call_back: null,
    miniature_err_download_call_back: null,
  })

  res.value.on_upload_progress = (progressEvent) => {
    res.value.progress = progressEvent.progress;
    if (loging) console.log("new_upload_file on_upload_progress", progressEvent);
  }

  res.value.download_call_back = (response)=>{
    res.value.uploaded = true;
    res.value.progress = 1;
    res.value.uploaded_url = response.data.url;
    if (loging) console.log("new_upload_file download_call_back", response);
  }

  res.value.err_download_call_back = (error)=>{
    if (loging) console.log("new_upload_file download_call_back", error);
  }

  res.value.miniature_download_call_back = (response) =>{
    res.value.miniature.uploaded = true;
    res.value.miniature.uploaded_url = response.data.url;

    if (loging) console.log("new_upload_file miniature_download_call_back", response);
  }

  res.value.miniature_err_download_call_back = (error) =>{

    if (loging) console.log("new_upload_file miniature_err_download_call_back", error);
  }

  res.value.miniature_call_back = (m_url)=>{
    res.value.miniature.loading = false;
    res.value.miniature.url = m_url;

    let file_neme = uuidv4()+".png";
    let m_file = dataURLToFile(m_url, file_neme);

    const m_formData = new FormData();
    m_formData.append('file', m_file);

    axios.post(FILE_UPLOAD_URL+"?token="+token, m_formData,)
    .then((e)=>{if (res.value.miniature_download_call_back) res.value.miniature_download_call_back(e);})
    .catch((e)=>{if (res.value.miniature_err_download_call_back) res.value.miniature_err_download_call_back(e);})

    if (loging) console.log("new_upload_file miniature_call_back", m_url);
  }

  if (file.type.startsWith('video/')){
    generateVideoPreview(res.value.url).then((e)=>{if (res.value.miniature_call_back) res.value.miniature_call_back(e);});
  }

  const formData = new FormData();
  formData.append('file', file);
  
  axios.post(FILE_UPLOAD_URL+"?token="+token, formData, 
  {
    onUploadProgress: (e)=> {if (res.value.on_upload_progress) res.value.on_upload_progress(e);},
  })
  .then((e)=>{if (res.value.download_call_back) res.value.download_call_back(e);})
  .catch((e)=>{if (res.value.err_download_call_back) res.value.err_download_call_back(e);})
  
  return res;
}

function dataURLToFile(dataURL, fileName) {
  // Разделяем dataURL на тип MIME и Base64-данные
  const [header, base64] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const byteString = atob(base64);
  const arrayBuffer = new Uint8Array(byteString.length);

  // Создаем массив байтов
  for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
  }

  // Преобразуем в объект File
  return new File([arrayBuffer], fileName, { type: mimeType });
}