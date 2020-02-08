import { BrowserWindow } from 'electron';

import * as ytdl from 'ytdl-core';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sanitize = require('sanitize-filename');
// import sanitize = require('sanitize-filename');

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
      const videoInfo = {
        title: info.title,
        duration: info.length_seconds,
        avatar: info.author.avatar,
      };

      await ffmpeg(videostream)
        .format('mp4')
        .on('start', () => {
          this?.win?.webContents.send('video:start-loading');
        })
        .on('progress', (progress: any) => {
          this?.win?.webContents.send('video:info', { videoInfo, progress });
        })
        .on('end', () => {
          this?.win?.webContents.send('video:end');
        })
        .save(path.join(__dirname, sanitize(`${info.title}.mp4`)));
    } catch (e) {
      this?.win?.webContents.send('video:download-error', e.message);
    }
  }
}

export default VideoService;