import { useState, useEffect, useRef } from 'react';
import type {
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '../types/speech'; // パスはファイル構成に合わせて修正

interface ExtendedSpeechRecognition extends SpeechRecognition {
  onstart?: () => void;
  onaudiostart?: () => void;
  onspeechstart?: () => void;
}

// 型定義（SpeechRecognition を使うため）
type SpeechRecognitionType = typeof window.SpeechRecognition extends undefined
  ? typeof window.webkitSpeechRecognition
  : typeof window.SpeechRecognition;

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ログ出力関数（スマホにも表示用）
  const log = (message: string) => {
    console.log(message);
    setDebugLog(prev => prev + '\n' + message);
  };

  // Check browser support
  useEffect(() => {
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(hasMediaRecorder && hasSpeechRecognition);

    if (!hasMediaRecorder) {
      setError('お使いのブラウザは音声録音に対応していません。');
    } else if (!hasSpeechRecognition) {
      setError('お使いのブラウザは音声認識に対応していません。Chrome、Edge、Safariをお試しください。');
    }
  }, []);

  const startRecording = async () => {
    if (isRecording) {
      log('⚠️ 録音中のため startRecording をスキップします');
      return;
    }
    
    log('🎬 startRecording が呼ばれました'); // 最初に追加
    if (!isSupported) {
      setError('音声録音または音声認識がサポートされていません。');
      return;
    }

    try {
      setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
      });
      log('🎙 マイクの取得に成功しました');
    } catch (e) {
      log('❌ マイク取得失敗: ' + (e instanceof Error ? e.message : String(e)));
      setError('マイクの取得に失敗しました。ブラウザの設定や権限をご確認ください。');
      return;
    }

    let mediaRecorder: MediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
      });
      log('🎛 MediaRecorder の作成に成功しました');
    } catch (err) {
      console.error('🎤 MediaRecorder の作成に失敗:', err);
      setError('録音機能がこのブラウザでサポートされていないか、初期化に失敗しました。');
      return;
    }
      mediaRecorderRef.current = mediaRecorder;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      log('🧠 SpeechRecognition インスタンスを作成します');

      const recognition = new SpeechRecognition() as ExtendedSpeechRecognition;
      log('🧠 SpeechRecognition の作成に成功しました');
      
      recognition.onstart = () => {
        log('🎙 onstart: 音声認識が開始されました');
      };

      recognition.onaudiostart = () => {
        log('🎧 onaudiostart: 音声入力が検出されました');
      };

      recognition.onspeechstart = () => {
        log('🗣 onspeechstart: 音声が話され始めました');
      };

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ja-JP';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        log('✅ onresult が呼ばれました');
        console.log('🎧 event:', event);

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          log(`📝 transcript: ${transcript} (confidence: ${confidence})`);

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            log(`📄 確定テキスト: ${transcript} (confidence: ${confidence})`);
            setTranscript(finalTranscript + interimTranscript);
          } else {
            interimTranscript += transcript;
            log(`📄 仮テキスト: ${transcript} (confidence: ${confidence})`);
            setTranscript(finalTranscript + interimTranscript);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        log(`❌ 音声認識エラー: ${event.error}`);
        if (event.error === 'no-speech') {
          setError('音声が検出されませんでした。');
        } else if (event.error === 'audio-capture') {
          setError('マイクにアクセスできませんでした。');
        } else if (event.error === 'not-allowed') {
          setError('マイクの使用が許可されていません。');
        } else {
          setError(`音声認識エラー: ${event.error}`);
        }
      };

      recognition.onend = () => {
        log('🎤 音声認識が終了しました');
        if (isRecording) {
          try {
            recognition.start();
            log('🎤 音声認識を再開しました');
          } catch (e) {
            log(`❌ 音声認識の再開に失敗: ${e}`);
            console.error('Recognition restart failed:', e);
          }
        }
      };

      recognitionRef.current = recognition;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        console.log('録音ファイル（blob）:', blob);
        // const audioURL = URL.createObjectURL(blob);
        // const audio = new Audio(audioURL);
        // audio.play();
      };

      mediaRecorder.start();
      recognition.start();

      setIsRecording(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        setError(`録音開始エラー: ${error.message}`);
      } else {
        setError('録音を開始できませんでした。');
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const downloadTranscript = () => {
    if (!transcript.trim()) {
      setError('ダウンロードする文字起こしがありません。');
      return;
    }

    const file = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `会議議事録_${new Date().toLocaleDateString('ja-JP')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    transcript,
    isSupported,
    error,
    debugLog,
    startRecording,
    stopRecording,
    downloadTranscript,
  };
};

// グローバル型宣言
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}