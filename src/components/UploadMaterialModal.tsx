import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Image,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { geminiService } from '../services/geminiService';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultTopicId?: string;
  onProcessedSuccess?: (subjectId: string, topicId: string) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultTopicId,
  onProcessedSuccess,
}) => {
  const { subjects, addCustomTopic, saveTopicAIContent } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    defaultSubjectId || subjects[0]?.id || ''
  );
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    defaultTopicId || selectedSubject?.topics[0]?.id || ''
  );
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const [uploadMode, setUploadMode] = useState<'text' | 'image'>('text');
  const [notesText, setNotesText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetTopicId = selectedTopicId;
    let topicName = selectedSubject?.topics.find((t) => t.id === selectedTopicId)?.name || '';

    if (isCreatingNewTopic) {
      if (!newTopicName.trim()) {
        setErrorMsg('Please enter a title for the new topic.');
        return;
      }
      targetTopicId = addCustomTopic(selectedSubject.id, newTopicName.trim());
      topicName = newTopicName.trim();
    }

    if (uploadMode === 'text' && !notesText.trim()) {
      setErrorMsg('Please paste or write your study notes.');
      return;
    }

    if (uploadMode === 'image' && !imageFile && !imagePreview) {
      setErrorMsg('Please upload a photograph or image of your study material.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('Analyzing material & extracting core Grade 12 concepts...');

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (uploadMode === 'image' && imagePreview) {
        imageBase64 = imagePreview.split(',')[1];
        mimeType = imageFile?.type || 'image/jpeg';
      }

      setCurrentStep('Synthesizing Smart Notes, Flashcards, Quiz & Games...');

      const aiData = await geminiService.processStudyMaterial({
        subject: selectedSubject.name,
        topic: topicName,
        notesText: uploadMode === 'text' ? notesText : undefined,
        imageBase64,
        mimeType,
      });

      if (aiData) {
        saveTopicAIContent(selectedSubject.id, targetTopicId, {
          notes: aiData.notes,
          flashcards: aiData.flashcards,
          quizQuestions: aiData.quizQuestions,
          keyTerms: aiData.keyTerms,
        });

        if (onProcessedSuccess) {
          onProcessedSuccess(selectedSubject.id, targetTopicId);
        }
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process material. Please check your text or try again.');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Upload & Process Notes
              </h2>
              <p className="text-xs text-slate-400">
                Transform raw material into interactive notes, flashcards, quizzes & games.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleProcess} className="space-y-4">
          {/* Subject & Topic Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Subject:
              </label>
              <select
                value={selectedSubjectId}
                disabled={isProcessing}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const sub = subjects.find((s) => s.id === e.target.value);
                  if (sub && sub.topics.length > 0) {
                    setSelectedTopicId(sub.topics[0].id);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-400 uppercase">
                  Topic:
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewTopic(!isCreatingNewTopic)}
                  className="text-[11px] text-blue-500 font-bold hover:underline"
                >
                  {isCreatingNewTopic ? 'Choose Existing' : '+ New Topic'}
                </button>
              </div>

              {!isCreatingNewTopic ? (
                <select
                  value={selectedTopicId}
                  disabled={isProcessing}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                >
                  {selectedSubject?.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Meiosis, Calculus..."
                  value={newTopicName}
                  disabled={isProcessing}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setUploadMode('text')}
              disabled={isProcessing}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                uploadMode === 'text'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Notes / Text</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('image')}
              disabled={isProcessing}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                uploadMode === 'image'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Photo / Handwritten Notes</span>
            </button>
          </div>

          {/* Text Input Area */}
          {uploadMode === 'text' && (
            <div>
              <textarea
                rows={6}
                placeholder="Paste class notes, summary points, textbook extracts, or teacher handouts..."
                value={notesText}
                disabled={isProcessing}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Image Upload Area */}
          {uploadMode === 'image' && (
            <div className="space-y-3">
              <label className="block p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {imageFile ? imageFile.name : 'Click or Drag photo of notes / past papers'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, JPEG, WebP</p>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isProcessing}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-750">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Study Modules...</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">{currentStep}</p>
            </div>
          )}

          {/* Submit Row */}
          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center space-x-2 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <span>Processing with Gemini...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
