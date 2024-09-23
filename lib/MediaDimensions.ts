import {fileToMedia} from "./tools";

export default class MediaDimensions {
    media: File;
    type: string;

    constructor(file: File, type) {
        this.media = file;
        this.type = type;
    }

    private async image(src: string, resolve) {
        const img = new Image();
        img.onload = () => resolve({height: img.naturalHeight, width: img.naturalWidth});
        img.src = src;
    }

    private async video(src: string, resolve) {
        const video = document.createElement('video');
        document.body.appendChild(video)
        video.addEventListener("loadedmetadata", function () {
            const height = this.videoHeight;
            const width = this.videoWidth;
            resolve({height, width});
        }, false);
        video.src = src;
    }

    public get(): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            const mediaSource = fileToMedia(this.media);
            switch (this.type) {
                case 'image':
                    return this.image(mediaSource, resolve);
                case 'video':
                    return this.video(mediaSource, resolve);
            }
        });
    }
}

