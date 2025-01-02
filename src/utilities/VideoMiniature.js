export function generateVideoPreview(width, height, url) {
    return new Promise(function (resolve, reject) {
        const videoElement = document.createElement('video');
        videoElement.width = width;
        videoElement.height = height;
        videoElement.style.display = 'none'; 
        videoElement.src = url;

        videoElement.crossOrigin = 'anonymous';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Когда видео загружено, делаем превью
        videoElement.onloadeddata = function () {
            // Устанавливаем время на 2 секунды, чтобы взять кадр с этого времени
            videoElement.currentTime = 2;
            // После того как видео перемотается, рисуем кадр
            videoElement.onseeked = () => {

                // Рисуем текущий кадр на канвасе
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                videoElement.pause(); // Останавливаем воспроизведение видео
                let preview_url =  canvas.toDataURL('image/png');

                // Удаляем элемент <video> после того, как превью сделано
                videoElement.remove();
                canvas.remove();

                resolve(preview_url);
            };
        };

        videoElement.load();
        videoElement.play().catch(function() {
            reject();
          });
    })
}