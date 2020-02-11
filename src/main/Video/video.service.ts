import { BrowserWindow } from 'electron';
import { existsSync, readFile } from 'fs';
import * as ytdl from 'ytdl-core';
import moveFile from 'move-file';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sanitize = require('sanitize-filename');

interface Progress {
  frames?: string,
  currentFps?: string,
  currentKbps: string,
  targetSize: string,
  timemark: string,
  percent?: string,
}

class VideoService {
  constructor(private readonly win: BrowserWindow | null) {
  }

  private async movieFileTo(fromPath: string, to: string) {
    await moveFile(fromPath, to);
    await this?.win?.webContents.send('post:process-done');
  }

  async download(url: string) {
    try {
      const info = await ytdl.getInfo(url);
      console.log(info);
      const videostream = await ytdl.downloadFromInfo(info, {
        filter: 'audioandvideo',
      });
      const videoInfo = {
        title: info.title,
        duration: info.length_seconds,
        avatar: info.author.avatar,
      };

      let fileSavePath = '';
      if(existsSync(path.join(process.cwd(), 'uploads'))) {
        await readFile(path.join(process.cwd(), 'uploads', 'path.txt'), 'utf-8', (err, data) => {
          if (err) throw err;
          fileSavePath = data;
        });
      }

      await ffmpeg(videostream)
        .format('mp4')
        .on('start', () => {
          this?.win?.webContents.send('video:start-loading');
        })
        .on('progress', (progress: Progress) => {
          this?.win?.webContents.send('video:info', { videoInfo, progress });
        })
        .on('end', async () => {
          await this?.win?.webContents.send('video:end');
          const fromPath = path.join(process.cwd(), 'uploads', sanitize(`${info.title}.mp4`));
          const toPath = path.join(fileSavePath, sanitize(`${info.title}.mp4`));
          await this.movieFileTo(fromPath, toPath);
        })
        .save(path.join(process.cwd(), 'uploads', sanitize(`${info.title}.mp4`)));

    } catch (e) {
      this?.win?.webContents.send('video:download-error', e.message);
    }
  }
}

export default VideoService;