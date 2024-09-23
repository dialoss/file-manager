export function getContextParams(params) {
    let s = [];
    for (const p in params) {
        s.push(p + "=" + params[p])
    }
    return s.join("|")
}

export function fileToMedia(file: File | ArrayBuffer): string {
    let blob = new Blob([file], {type: file.type});
    return window.URL.createObjectURL(blob);
}

const types: { [key: string]: string[] } = {
    'image': ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],
    'video': ['mp4', 'avi', 'mkv'],
    'model': ['sldprt', 'sldasm', 'glb', 'obj', 'stl', 'gltf'],
}

export function getFileType(text: string) {
    const ext = text.split('.').slice(-1)[0].toLowerCase();
    for (const type in types) {
        if (types[type].includes(ext)) return type;
    }
    return 'file';
}


export function formatCloudFiles(files) {
    return files.map(f => {
        console.log(f)
        let url = f.public_id;
        let type = "image";
        let ext = url.split('.').at(-1).toLowerCase().trim();
        let size = f.bytes;
        let width = f.width;
        let height = f.height;
        let thumb = "";
        let name = f.original_filename || f.public_id.split('/').at(-1);

        if (f.context && f.context.custom) {
            let c = f.context.custom;
            type = c.type;
            size = c.size;
            url = c.url;
            width = c.width;
            height = c.height;
        }
        if (type === 'video') {
            thumb = f.public_id;
        }

        if (type === 'model') width = height = 1;
        return {
            url,
            type,
            filename: name + "." + ext,
            width,
            height,
            size,
            thumb
        }
    })
}

export function getVideoImage(file) {
    return new Promise(resolve => {
        const path = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.style.display = 'none'

        video.src = path;
        video.load();
        video.currentTime = 0.01;

        video.oncanplay = () => {
            const canvas = document.createElement('canvas');
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL();
            const blobBin = atob(dataURL.split(',')[1]);
            const array = [];
            for (let i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            resolve(new Blob([new Uint8Array(array)], {type: 'image/png'}));
        }
    });
}

import imageCompression, {Options} from 'browser-image-compression';

export function compressImage(image) {
    const options: Options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1800,
        useWebWorker: true,
        fileType: 'image/webp'
    };
    return imageCompression(image, options);
}