import axios from 'axios';

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
