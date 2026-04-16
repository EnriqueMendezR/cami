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
 * Concatenates two video files: videoB plays first, then videoA.
 * @param {string} videoBPath - Path to the first video to play (videoB).
 * @param {string} videoAPath - Path to the second video to play (videoA).
 * @param {string} outputPath - Destination path for the combined video.
 * @returns {Promise<string>} Resolves with outputPath on success.
 */
export function concatenateVideos(videoBPath, videoAPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(fwd(videoBPath))
      .input(fwd(videoAPath))
      .outputOptions([
        '-filter_complex',
        '[0:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=fps=30,setsar=1[v0];' +
        '[1:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=fps=30,setsar=1[v1];' +
        '[v0][v1]concat=n=2:v=1:a=0[outv]',
        '-map', '[outv]',
        '-an',
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
