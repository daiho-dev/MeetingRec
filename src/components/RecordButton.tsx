import React, { useState } from 'react';
import { Mic, Square, AlertCircle, Settings, X } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  onToggleRecording: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  isSupported, 
  error,
  onToggleRecording 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const getStatusText = () => {
    if (!isSupported) return 'ブラウザが対応していません';
    if (error) return 'エラーが発生しました';
    if (isRecording) return '録音中...';
    return '録音準備完了';
  };

  const getStatusColor = () => {
    if (!isSupported || error) return 'text-red-600';
    if (isRecording) return 'text-green-600';
    return 'text-gray-700';
  };

  const isPermissionError = error && (
    error.includes('許可') || 
    error.includes('アクセス') || 
    error.includes('NotAllowedError') ||
    error.includes('not-allowed')
  );

  const openPermissionGuide = () => {
    setShowPermissionGuide(true);
  };

  const closePermissionGuide = () => {
    setShowPermissionGuide(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          onClick={onToggleRecording}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={!isSupported}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
            !isSupported
              ? 'bg-gray-400 cursor-not-allowed'
              : isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-green-400 hover:bg-green-500'
          }`}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            !isSupported
              ? 'bg-gray-500'
              : isRecording 
              ? 'bg-red-600' 
              : 'bg-green-500'
          }`}>
            {!isSupported ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : isRecording ? (
              <Square className="w-8 h-8 text-white" fill="currentColor" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>
        </button>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              {!isSupported 
                ? 'ブラウザが対応していません' 
                : isRecording 
                ? '録音停止' 
                : '録音開始'
              }
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className={`text-lg font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {isSupported ? (
            <>マイク: デフォルトマイク 認識言語: 日本語 (Japanese)</>
          ) : (
            <>Chrome、Edge、Safariブラウザをご利用ください</>
          )}
        </p>
        {isRecording && (
          <p className="text-xs text-green-600 mt-2 animate-pulse">
            🔴 録音中 - 話しかけてください
          </p>
        )}
      </div>

      {/* Permission Error Guide Button */}
      {isPermissionError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 font-medium">マイクアクセスが必要です</p>
          </div>
          <p className="text-red-700 text-sm mb-3">
            録音機能を使用するには、ブラウザでマイクの使用を許可してください。
          </p>
          <button
            onClick={openPermissionGuide}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            <Settings className="w-4 h-4" />
            マイク設定の手順を見る
          </button>
        </div>
      )}

      {/* Permission Guide Modal */}
      {showPermissionGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">マイク許可設定の手順</h3>
                <button
                  onClick={closePermissionGuide}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Chrome */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">C</span>
                    </div>
                    Google Chrome
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>アドレスバーの左側にある🔒（鍵）アイコンをクリック</li>
                    <li>「マイク」の項目を「許可」に変更</li>
                    <li>ページを再読み込み（F5キー）</li>
                  </ol>
                </div>

                {/* Safari */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">S</span>
                    </div>
                    Safari
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Safari → 設定 → Webサイト → マイク</li>
                    <li>このサイトを「許可」に設定</li>
                    <li>ページを再読み込み</li>
                  </ol>
                </div>

                {/* Edge */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">E</span>
                    </div>
                    Microsoft Edge
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>アドレスバーの左側にある🔒（鍵）アイコンをクリック</li>
                    <li>「マイク」の項目を「許可」に変更</li>
                    <li>ページを再読み込み（F5キー）</li>
                  </ol>
                </div>

                {/* General Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 ヒント</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>マイクが正しく接続されているか確認してください</li>
                    <li>他のアプリケーションがマイクを使用していないか確認してください</li>
                    <li>ブラウザを再起動すると問題が解決する場合があります</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePermissionGuide}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordButton;