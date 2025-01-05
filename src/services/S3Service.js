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
    url:null,
    temp_url: URL.createObjectURL(file),
    progress: 0,
    uploaded: false,

    miniature: {
        loading: true,
        url: null,
    },

    on_upload_progress: null,
    download_call_back: null,
    err_download_call_back: null,
    delete_call: null,
    miniature_call_back: null
  })

  res.value.on_upload_progress = (progressEvent) => {
    res.value.progress = progressEvent.progress;
    if (loging) console.log("new_upload_file on_upload_progress", progressEvent);
  }

  res.value.download_call_back = (response)=>{
    res.value.uploaded = true;
    res.value.progress = 1;
    res.value.url = response.data.url;
    if (loging) console.log("new_upload_file download_call_back", response);
  }

  res.value.err_download_call_back = (error)=>{
    if (loging) console.log("new_upload_file download_call_back", error);
  }

  res.value.miniature_call_back = (m_url)=>{
    res.value.miniature.loading = false;
    res.value.miniature.url = m_url;
    if (loging) console.log("new_upload_file miniature_call_back", m_url);
  }

  if (file.type.startsWith('video/')){
    generateVideoPreview(320, 240, res.value.temp_url).then((e)=>{if (res.value.miniature_call_back) res.value.miniature_call_back(e);});
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