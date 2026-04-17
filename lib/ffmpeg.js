import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import os from 'os'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// fluent-ffmpeg on Windows rejects backslash paths — normalize to forward slashes
function fwd(p) {
  return p.split(path.sep).join('/')
}

/**
 * Concatenates two video files: video1 plays first, then video2.
 * Output is forced to 9:16 portrait (1080×1920) with black letterbox padding.
 * Both audio tracks are preserved and concatenated.
 * @param {string} video1Path - Path to the first video to play.
 * @param {string} video2Path - Path to the second video to play.
 * @param {string} outputPath - Destination path for the combined video.
 * @returns {Promise<string>} Resolves with outputPath on success.
 */
export function concatenateVideos(video1Path, video2Path, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(fwd(video1Path))
      .input(fwd(video2Path))
      .outputOptions([
        '-filter_complex',
        '[0:v]setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=decrease,' +
          'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,setsar=1[v0];' +
        '[1:v]setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=decrease,' +
          'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,setsar=1[v1];' +
        '[0:a]asetpts=PTS-STARTPTS[a0];' +
        '[1:a]asetpts=PTS-STARTPTS[a1];' +
        '[v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]',
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-crf', '23',
      ])
      .output(fwd(outputPath))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run()
  })
}

/**
 * Builds an output path in /tmp (or the OS temp dir) for a stitched video.
 * @returns {string}
 */
export function makeTmpOutputPath() {
  return path.join(os.tmpdir(), `stitched_${Date.now()}.mp4`)
}
