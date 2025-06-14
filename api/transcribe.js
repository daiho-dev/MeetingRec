import { SpeechClient } from '@google-cloud/speech';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';

// multerのセットアップ
const upload = multer({ dest: os.tmpdir() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 環境変数からサービスアカウントJSONを一時ファイルに保存
  const keyPath = path.join(os.tmpdir(), 'gcp-key.json');
  fs.writeFileSync(keyPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  await runMiddleware(req, res, upload.single('file'));

  const client = new SpeechClient({ keyFilename: keyPath });

  try {
    const file = fs.readFileSync(req.file.path);
    const audioBytes = file.toString('base64');
    const audio = { content: audioBytes };
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 44100,
      languageCode: 'ja-JP',
    };
    const request = { audio, config };
    const [response] = await client.recognize(request);
    const transcription = response.results.map(r => r.alternatives[0].transcript).join('\n');
    res.status(200).json({ text: transcription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    // 一時ファイルの削除
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
  }
} 