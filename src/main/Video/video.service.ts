import { BrowserWindow } from 'electron';
import * as fs from 'fs';

import * as ytdl from 'ytdl-core';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

interface Progress {
  frames: string,
  currentFps: string,
  currentKbps: string,
  targetSize: string,
  timemark: string,
  percent: string,
}

class VideoService {
  constructor(private readonly win: BrowserWindow | null) {
  }

  async download(url: string) {
    try {
      const info = await ytdl.getInfo(url);
      const videostream = await ytdl.downloadFromInfo(info, {
        quality: 'lowest',
        // filter: 'audioandvideo'
      });
      console.log(info.ismb);
      const videoInfo = {
        title: info.title,
        duration: info.length_seconds,
        tumbnail: info.thumbnail_url,
      };

      await ffmpeg(videostream)
        .format('mp4')
        .on('start', () => {
          console.log('start');
          this?.win?.webContents.send('video:start-loading');
        })
        .on('progress', (progress: any) => {
          this?.win?.webContents.send('video:info', { videoInfo, progress });
        })
        .on('end', () => {
          console.log('end');
          this?.win?.webContents.send('video:end');
        })
        .save(path.join(__dirname, 'video.mp4'));
    } catch (e) {
      this?.win?.webContents.send('video:download-error', e.message);
      console.log('from error', e.message);
    }
  }
}

export default VideoService;