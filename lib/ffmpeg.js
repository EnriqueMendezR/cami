import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
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

/**
 * Downloads a video from a URL to a temp file and returns the file path.
 * @param {string} url
 * @param {string} label - used in the filename for debugging
 * @returns {Promise<string>} path to the downloaded file
 */
export async function downloadToTemp(url, label = 'video') {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${label}: HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filePath = path.join(os.tmpdir(), `leh_${label}_${Date.now()}.mp4`)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

/**
 * Runs ffprobe on a file and returns its metadata.
 * @param {string} filePath
 * @returns {Promise<import('fluent-ffmpeg').FfprobeData>}
 */
export function probeVideo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fwd(filePath), (err, metadata) => {
      if (err) reject(err)
      else resolve(metadata)
    })
  })
}

/**
 * Concatenates two silent 9:16 videos without re-encoding audio.
 * Both inputs must have no audio streams.
 * @param {string} video1Path - plays first
 * @param {string} video2Path - plays second
 * @param {string} outputPath
 * @returns {Promise<string>}
 */
export function concatenateSilentVideos(video1Path, video2Path, outputPath) {
  const scale =
    'scale=720:1280:force_original_aspect_ratio=decrease,' +
    'pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30'
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(fwd(video1Path))
      .input(fwd(video2Path))
      .outputOptions([
        '-filter_complex',
        `[0:v]setpts=PTS-STARTPTS,${scale}[v0];[1:v]setpts=PTS-STARTPTS,${scale}[v1];[v0][v1]concat=n=2:v=1:a=0[outv]`,
        '-map', '[outv]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-an',
      ])
      .output(fwd(outputPath))
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run()
  })
}
