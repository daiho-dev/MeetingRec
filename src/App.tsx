import { Headphones } from 'lucide-react';
import RecordButton from './components/RecordButton';
import AudioWaveform from './components/AudioWaveform';
import TranscriptionPanel from './components/TranscriptionPanel';
import { useRecording } from './hooks/useRecording';

function App() {
  const {
    isRecording,
    transcript,
    isSupported,
    error,
    debugLog,
    startRecording,
    stopRecording,
    downloadTranscript
  } = useRecording();

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">MeetingRec.app</h1>
          </div>
          <p className="text-purple-100 text-lg">無料 音声録音＆リアルタイム文字起こし</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-12">
          {/* Recording Section */}
          <div className="flex flex-col items-center gap-8">
            <RecordButton 
              isRecording={isRecording}
              isSupported={isSupported}
              error={error}
              onToggleRecording={handleToggleRecording}
            />
            
            {/* Audio Waveform */}
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
              <AudioWaveform isRecording={isRecording} />
            </div>
          </div>

          {/* Transcription Panel */}
          <TranscriptionPanel
            isRecording={isRecording}
            transcript={transcript}
            error={error}
            onDownload={downloadTranscript}
            debugLog={debugLog} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>高品質な音声認識技術で、あなたの会議をより効率的に</p>
          <p className="text-sm mt-2 text-gray-500">
            ※ 音声認識にはマイクアクセスの許可が必要です。Chrome、Edge、Safariブラウザを推奨します。
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;