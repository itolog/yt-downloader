import * as ytdl from 'ytdl-core';

class VideoService {
  async download(url: string) {
    const info = await ytdl.getInfo(url);

    const videostream = await ytdl(url, {
      quality: 'lowest',
    });
    console.log(videostream.progress);


    return {
      title: info.title,
      duration: info.length_seconds,
      tumbnail: info.thumbnail_url,
    };
  }
}

export default VideoService;