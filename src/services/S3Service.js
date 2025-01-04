import axios from 'axios';
import {ref} from 'vue';
import { uuidv4 } from '@/utilities/uuid';
import generateVideoPreview from "@/utilities/VideoMiniature";

const loging = true;

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const FILE_UPLOAD_URL = `${API_BASE_URL}${process.env.VUE_APP_FILE_UPLOAD_URL}`;

export async function upload_file(file_info_ref, token) {
  const formData = new FormData();
  formData.append('file', file_info_ref.value.file);
  // formData.append('token', token)
  axios.post(FILE_UPLOAD_URL+"?token="+token, formData, {
    onUploadProgress: (progressEvent) => {
      file_info_ref.value.progress = progressEvent.progress;
    //   console.log(context)
    //   context.$set(file_info, 'progress', progressEvent.progress);
      // file_info.progress = 0.5;
      console.log(progressEvent);
    }
  }).then(function(response){
    console.log(response);
    file_info_ref.value.uploaded = true;
    file_info_ref.value.url = response.data.url;
    if (file_info_ref.value.download_call_back){
        file_info_ref.value.download_call_back();
    }
  }).catch( function (error) {
      console.log(error);
      if (file_info_ref.value.err_download_call_back){
        file_info_ref.value.err_download_call_back();
      }
    }
  )
}


export function new_upload_file(file, token) {
  let res = ref({
    id: uuidv4(),
    name: file.name,
    url:null,
    temp_url: URL.createObjectURL(file),
    progress: 0,
    uploaded: false,

    miniature: {
        loging: true,
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
    res.value.miniature.loging = false;
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
