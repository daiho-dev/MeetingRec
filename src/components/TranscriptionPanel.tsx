import React from "react";
import { FileText, Download, AlertCircle } from "lucide-react";

interface TranscriptionPanelProps {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  onDownload: () => void;
  debugLog: string;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  isRecording,
  transcript,
  error,
  onDownload,
  debugLog,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          リアルタイム文字起こし
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">エラーが発生しました</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mb-4">
        {transcript ? (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {transcript}
            {isRecording && <span className="animate-pulse">|</span>}
          </p>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 italic mb-2">
              {isRecording
                ? "音声を認識中です。話しかけてください..."
                : "録音を開始すると文字起こしがここに表示されます。"}
            </p>
            {!isRecording && (
              <p className="text-gray-400 text-sm">
                ※ 初回録音時はマイクアクセスの許可が必要です
              </p>
            )}
          </div>
        )}
      </div>

      {/* ✅ transcript ブロックの外に出す */}
      {debugLog && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs whitespace-pre-wrap text-gray-800 overflow-x-auto">
          <h3 className="font-bold mb-2">デバッグログ</h3>
          <pre>{debugLog}</pre>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onDownload}
          disabled={!transcript.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          <Download className="w-4 h-4" />
          文字起こしをダウンロード
        </button>

        {transcript.trim() && (
          <div className="flex items-center text-sm text-gray-600 px-3">
            文字数: {transcript.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionPanel;
