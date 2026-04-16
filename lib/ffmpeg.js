import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import os from 'os'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

/**
 * Concatenates two video files: videoB plays first, then videoA.
 * @param {string} videoBPath - Path to the first video to play (videoB).
 * @param {string} videoAPath - Path to the second video to play (videoA).
 * @param {string} outputPath - Destination path for the combined video.
 * @returns {Promise<string>} Resolves with outputPath on success.
 */
export function concatenateVideos(videoBPath, videoAPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoBPath)
      .input(videoAPath)
      .outputOptions([
        '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]',
        '-map', '[outv]',
        '-map', '[outa]',
      ])
      .output(outputPath)
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
