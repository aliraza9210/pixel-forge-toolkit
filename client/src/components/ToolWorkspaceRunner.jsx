import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  Scissors,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function ToolWorkspaceRunner({ tool }) {
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState({
    format: 'webp',
    quality: 85,
    width: '',
    height: '',
    fit: 'inside',
    maintainAspectRatio: true,
    angle: 90,
    flipH: false,
    flipV: false,
    text: '',
    fontSize: 28,
    color: '#ffffff',
    opacity: 0.5,
    grayscale: false,
    blur: 0,
    sharpen: 0,
    brightness: 1.0,
    contrast: 1.0,
    password: '',
    splitMode: 'range',
    ranges: '1',
    question: '',
    targetLanguage: 'es',
    qrText: 'https://pixelforge.dev',
    qrSize: 320,
    qrDark: '#000000',
    qrLight: '#ffffff',
    placeholderWidth: 600,
    placeholderHeight: 400,
    placeholderBg: '#1e293b',
    placeholderText: 'PixelForge Placeholder',
    placeholderColor: '#a3e635',
    tolerance: 28,
    targetColor: '',
    useAutoBg: true,
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
  const isMultiple = ['bulk-compress', 'merge-pdf', 'jpg-to-pdf', 'compare-pdf'].includes(tool.id);
  const isGenerator = ['qr-code-generator', 'placeholder-image'].includes(tool.id);
  const isTextTool = ['text-to-pdf', 'ai-pdf-summarizer'].includes(tool.id);

  // Set default format based on tool
  useEffect(() => {
    if (tool.id === 'jpg-to-png') setOptions((o) => ({ ...o, format: 'png' }));
    else if (tool.id === 'png-to-jpg') setOptions((o) => ({ ...o, format: 'jpg' }));
    else if (tool.id === 'webp-converter') setOptions((o) => ({ ...o, format: 'webp' }));
  }, [tool.id]);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    setError(null);
    const newFiles = acceptedFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    if (isMultiple) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  }, [isMultiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: isMultiple,
    maxSize: 35 * 1024 * 1024,
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) setResult(null);
  };

  const resetAll = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  // QR Code Generation
  const generateQRCode = useCallback(async () => {
    if (tool.id !== 'qr-code-generator' || !canvasRef.current) return;
    try {
      await QRCode.toCanvas(canvasRef.current, options.qrText || 'PixelForge', {
        width: options.qrSize,
        margin: 2,
        color: {
          dark: options.qrDark,
          light: options.qrLight,
        },
      });
    } catch (err) {
      console.warn('QR render error:', err);
    }
  }, [tool.id, options.qrText, options.qrSize, options.qrDark, options.qrLight]);

  // Placeholder Generator
  const generatePlaceholder = useCallback(() => {
    if (tool.id !== 'placeholder-image' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = parseInt(options.placeholderWidth, 10) || 600;
    canvas.height = parseInt(options.placeholderHeight, 10) || 400;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = options.placeholderBg || '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.fillStyle = options.placeholderColor || '#a3e635';
    ctx.font = `bold ${Math.max(16, Math.floor(canvas.width / 18))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      options.placeholderText || `${canvas.width} × ${canvas.height}`,
      canvas.width / 2,
      canvas.height / 2
    );
  }, [tool.id, options.placeholderWidth, options.placeholderHeight, options.placeholderBg, options.placeholderText, options.placeholderColor]);

  useEffect(() => {
    if (tool.id === 'qr-code-generator') generateQRCode();
    else if (tool.id === 'placeholder-image') generatePlaceholder();
  }, [tool.id, generateQRCode, generatePlaceholder]);

  // Client-Side Base64 encoder
  useEffect(() => {
    if (tool.id === 'base64-encode' && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setResult({
          base64: reader.result,
          originalName: files[0].name,
          size: files[0].size,
        });
      };
      reader.readAsDataURL(files[0].file);
    }
  }, [tool.id, files]);

  // Submit Processing Job
  const handleProcess = async () => {
    setError(null);
    setProcessing(true);
    setProgress(15);

    try {
      const progressTimer = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 15 : p));
      }, 200);

      const formData = new FormData();

      // Append files
      if (isMultiple) {
        files.forEach((f) => formData.append('files', f.file));
      } else if (files.length > 0) {
        formData.append('file', files[0].file);
      }

      // Append options
      Object.entries(options).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
        }
      });

      const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      let endpoint = '';
      if (tool.id === 'bulk-compress') {
        endpoint = `${apiBase}/api/process/image/bulk-compress`;
      } else if (tool.category.startsWith('Image') || tool.category === 'Background & Transparency') {
        endpoint = `${apiBase}/api/process/image/${tool.id}`;
      } else if (tool.category.startsWith('PDF')) {
        if (tool.id === 'ai-pdf-summarizer') {
          endpoint = `${apiBase}/api/process/ai/${tool.id}`;
        } else {
          endpoint = `${apiBase}/api/process/pdf/${tool.id}`;
        }
      } else if (tool.id === 'image-metadata') {
        endpoint = `${apiBase}/api/process/image/image-metadata`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Processing failed. Please check your inputs.');
      }

      setResult(data);
      toast.success(`${tool.name} completed successfully!`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Immediate Server File Cleanup
  const handleCleanup = async () => {
    if (!result?.file?.token) return;
    try {
      await fetch(`${apiBase}/api/process/cleanup/${result.file.token}`, { method: 'DELETE' });
      toast.success('Temporary file securely removed from server.');
      resetAll();
    } catch (err) {
      toast.error('Cleanup request failed.');
    }
  };

  // Download Client Generator (Canvas)
  const downloadCanvasImage = (format = 'png') => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${tool.id}_pixelforge.${format}`;
    link.href = canvasRef.current.toDataURL(`image/${format}`);
    link.click();
    toast.success('Downloaded generated file!');
  };

  return (
    <div className="w-full">
      {/* ─── Generator Tools UI ─────────────────────────────────────────────────── */}
      {isGenerator && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="card-depth p-6 space-y-4">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Configuration Controls
              </h3>

              {tool.id === 'qr-code-generator' && (
                <>
                  <div>
                    <label className="text-xs uppercase font-semibold text-muted block mb-1">
                      Text or Destination URL
                    </label>
                    <input
                      type="text"
                      className="input-field w-full text-sm"
                      value={options.qrText}
                      onChange={(e) => setOptions({ ...options, qrText: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">
                        Dark Color
                      </label>
                      <input
                        type="color"
                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-white/10"
                        value={options.qrDark}
                        onChange={(e) => setOptions({ ...options, qrDark: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">
                        Light Color
                      </label>
                      <input
                        type="color"
                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-white/10"
                        value={options.qrLight}
                        onChange={(e) => setOptions({ ...options, qrLight: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-muted block mb-1">
                      Size: {options.qrSize}px
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="600"
                      step="10"
                      value={options.qrSize}
                      onChange={(e) => setOptions({ ...options, qrSize: parseInt(e.target.value, 10) })}
                      className="w-full accent-lime-400"
                    />
                  </div>
                </>
              )}

              {tool.id === 'placeholder-image' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">Width (px)</label>
                      <input
                        type="number"
                        className="input-field w-full text-sm"
                        value={options.placeholderWidth}
                        onChange={(e) => setOptions({ ...options, placeholderWidth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">Height (px)</label>
                      <input
                        type="number"
                        className="input-field w-full text-sm"
                        value={options.placeholderHeight}
                        onChange={(e) => setOptions({ ...options, placeholderHeight: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-muted block mb-1">Label Text</label>
                    <input
                      type="text"
                      className="input-field w-full text-sm"
                      value={options.placeholderText}
                      onChange={(e) => setOptions({ ...options, placeholderText: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">Background Color</label>
                      <input
                        type="color"
                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-white/10"
                        value={options.placeholderBg}
                        onChange={(e) => setOptions({ ...options, placeholderBg: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-muted block mb-1">Text Color</label>
                      <input
                        type="color"
                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-[var(--border-medium)]"
                        value={options.placeholderColor}
                        onChange={(e) => setOptions({ ...options, placeholderColor: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => downloadCanvasImage('png')}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div className="card-depth p-6 flex flex-col items-center justify-center min-h-[300px]">
              <h4 className="text-xs font-semibold uppercase text-muted mb-4">Live Preview</h4>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] max-w-full overflow-auto">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── File Upload Dropzone (for non-generator tools) ────────────────────── */}
      {!isGenerator && files.length === 0 && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragActive
                ? 'border-[var(--accent-lime)] bg-[var(--accent-lime-glow)] shadow-lg'
                : 'border-[var(--border-medium)] hover:border-[var(--accent-lime)] bg-[var(--bg-card)]'
            }`}
            style={{ minHeight: '260px' }}
          >
            <input {...getInputProps()} />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
              style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}35` }}
            >
              <Upload className="w-8 h-8" style={{ color: tool.color }} />
            </div>
            <h3 className="text-lg font-bold mb-1">
              {isDragActive ? 'Drop your files here...' : `Upload ${tool.name} file`}
            </h3>
            <p className="text-xs text-muted mb-4 max-w-md">
              {isMultiple
                ? 'Drag & drop multiple files, or click to browse. Max 35MB per file.'
                : 'Drag & drop your file here, or click to select from your device.'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {tool.inputFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase text-muted"
                >
                  .{fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Optional Textarea for text-based tools */}
          {isTextTool && (
            <div className="card-depth p-5 mt-4">
              <h4 className="text-xs font-semibold uppercase text-muted mb-2">Or enter text directly</h4>
              <textarea
                className="input-field w-full text-sm font-mono h-28"
                placeholder="Type or paste document text here to process..."
                value={options.text}
                onChange={(e) => setOptions({ ...options, text: e.target.value })}
              />
              {options.text && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={processing}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Analyze Text
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Selected File(s) & Tool Workspace Controls ───────────────────────── */}
      {!isGenerator && files.length > 0 && !result && (
        <div className="space-y-6">
          {/* File Badges */}
          <div className="card-depth p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {files[0]?.preview ? (
                <img
                  src={files[0].preview}
                  alt={files[0].name}
                  className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-lime-400" />
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-semibold truncate max-w-xs">{files[0]?.name}</p>
                <p className="text-xs text-muted">
                  {formatBytes(files[0]?.size)}
                  {files.length > 1 && ` (+${files.length - 1} more file${files.length > 2 ? 's' : ''})`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="btn-ghost text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          {/* Multiple files preview list (if merge/bulk) */}
          {files.length > 1 && (
            <div className="card-depth p-4 space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold uppercase text-muted mb-2">Selected Files ({files.length})</h4>
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded bg-white/5">
                  <span className="truncate max-w-sm">{idx + 1}. {f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted">{formatBytes(f.size)}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="text-rose-400 hover:text-rose-300">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tool-specific interactive controls */}
          <div className="card-depth p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase text-muted flex items-center gap-2">
              <Sliders className="w-4 h-4 text-lime-400" /> Tool Settings
            </h3>

            {/* Resize Image */}
            {tool.id === 'resize-image' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Width (px)</label>
                  <input
                    type="number"
                    className="input-field w-full text-sm"
                    placeholder="e.g. 1920"
                    value={options.width}
                    onChange={(e) => setOptions({ ...options, width: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Height (px)</label>
                  <input
                    type="number"
                    className="input-field w-full text-sm"
                    placeholder="e.g. 1080"
                    value={options.height}
                    onChange={(e) => setOptions({ ...options, height: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Fitting Mode</label>
                  <select
                    className="input-field w-full text-sm"
                    value={options.fit}
                    onChange={(e) => setOptions({ ...options, fit: e.target.value })}
                  >
                    <option value="inside">Preserve Aspect Ratio (Inside)</option>
                    <option value="cover">Crop to Fit (Cover)</option>
                    <option value="fill">Exact Stretch (Fill)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Rotate & Flip */}
            {tool.id === 'rotate-image' && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Rotate 90° CW', angle: 90, flipH: false, flipV: false },
                  { label: 'Rotate 180°', angle: 180, flipH: false, flipV: false },
                  { label: 'Rotate 90° CCW', angle: 270, flipH: false, flipV: false },
                  { label: 'Flip Horizontal', angle: 0, flipH: true, flipV: false },
                  { label: 'Flip Vertical', angle: 0, flipH: false, flipV: true },
                ].map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setOptions({
                        ...options,
                        angle: act.angle,
                        flipH: act.flipH,
                        flipV: act.flipV,
                      })
                    }
                    className={`btn-secondary text-xs py-2 px-3.5 ${
                      options.angle === act.angle && options.flipH === act.flipH && options.flipV === act.flipV
                        ? 'border-lime-400 text-lime-400 bg-lime-400/10'
                        : ''
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}

            {/* Watermark */}
            {tool.id === 'watermark-image' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted block mb-1">Watermark Text</label>
                  <input
                    type="text"
                    className="input-field w-full text-sm"
                    placeholder="PixelForge Confidential"
                    value={options.text}
                    onChange={(e) => setOptions({ ...options, text: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Font Size: {options.fontSize}px</label>
                  <input
                    type="range"
                    min="14"
                    max="72"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: e.target.value })}
                    className="w-full accent-lime-400"
                  />
                </div>
              </div>
            )}

            {/* Remove Background Settings */}
            {tool.id === 'remove-background' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">
                      Background Sampling Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, useAutoBg: true, targetColor: '' })}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          options.useAutoBg
                            ? 'bg-lime-400 text-black shadow-md'
                            : 'bg-white/5 border border-white/10 text-muted'
                        }`}
                      >
                        Auto Border Detect
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptions({ ...options, useAutoBg: false, targetColor: options.targetColor || '#ffffff' })}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          !options.useAutoBg
                            ? 'bg-lime-400 text-black shadow-md'
                            : 'bg-white/5 border border-white/10 text-muted'
                        }`}
                      >
                        Custom Color Key
                      </button>
                    </div>
                  </div>

                  {!options.useAutoBg && (
                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">
                        Target Backdrop Color to Erase
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="w-12 h-9 rounded cursor-pointer bg-transparent border border-white/10"
                          value={options.targetColor || '#ffffff'}
                          onChange={(e) => setOptions({ ...options, targetColor: e.target.value })}
                        />
                        <span className="text-xs font-mono text-muted">{options.targetColor || '#ffffff'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-muted">Removal Tolerance / Sensitivity: {options.tolerance || 28}%</span>
                    <span className="text-lime-400">
                      {(options.tolerance || 28) < 20 ? 'Gentle (Preserves soft details)' : (options.tolerance || 28) < 45 ? 'Balanced (Recommended)' : 'Aggressive Cut'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="65"
                    value={options.tolerance || 28}
                    onChange={(e) => setOptions({ ...options, tolerance: parseInt(e.target.value, 10) })}
                    className="w-full accent-lime-400"
                  />
                  <p className="text-[11px] text-muted mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-lime-400 shrink-0" />
                    Subject facial protection active: Boundary flood-fill preserves inner face, eyes, and beard details.
                  </p>
                </div>
              </div>
            )}

            {/* Compression & Quality */}
            {['compress-image', 'bulk-compress'].includes(tool.id) && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-muted">Compression Quality: {options.quality}%</span>
                    <span className="text-lime-400">
                      {options.quality > 80 ? 'High Quality' : options.quality > 50 ? 'Balanced' : 'Max Compression'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    value={options.quality}
                    onChange={(e) => setOptions({ ...options, quality: e.target.value })}
                    className="w-full accent-lime-400"
                  />
                </div>
              </div>
            )}

            {/* Format Conversion */}
            {['convert-image', 'webp-converter', 'compress-image'].includes(tool.id) && (
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Target Output Format</label>
                <div className="flex flex-wrap gap-2">
                  {['webp', 'jpg', 'png', 'avif'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setOptions({ ...options, format: fmt })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-all ${
                        options.format === fmt
                          ? 'bg-lime-400 text-black shadow-md'
                          : 'bg-white/5 border border-white/10 text-muted hover:border-white/25'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Split PDF */}
            {tool.id === 'split-pdf' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted block">Split Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="range"
                      checked={options.splitMode === 'range'}
                      onChange={() => setOptions({ ...options, splitMode: 'range' })}
                    />
                    <span>Extract Page Range</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="all"
                      checked={options.splitMode === 'all'}
                      onChange={() => setOptions({ ...options, splitMode: 'all' })}
                    />
                    <span>All Pages (ZIP Archive)</span>
                  </label>
                </div>
                {options.splitMode === 'range' && (
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Pages to Extract</label>
                    <input
                      type="text"
                      className="input-field w-full text-sm"
                      placeholder="e.g. 1-3, 5"
                      value={options.ranges}
                      onChange={(e) => setOptions({ ...options, ranges: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* PDF Security: Password */}
            {['protect-pdf', 'unlock-pdf'].includes(tool.id) && (
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">
                  {tool.id === 'protect-pdf' ? 'Set Protection Password' : 'Enter PDF Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field w-full text-sm pr-10"
                    placeholder="Enter document password"
                    value={options.password}
                    onChange={(e) => setOptions({ ...options, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* AI Summarizer / Intelligence options */}
            {tool.id === 'ai-pdf-summarizer' && (
              <div className="space-y-4">
                <label className="text-xs font-semibold text-muted block">AI Action</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'summarize', label: 'Executive Summary' },
                    { id: 'key-points', label: 'Key Insights' },
                    { id: 'study-questions', label: 'Study Quiz' },
                    { id: 'outline', label: 'Document Outline' },
                    { id: 'ask-pdf', label: 'Ask a Question' },
                  ].map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setOptions({ ...options, aiTask: task.id })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        (options.aiTask || 'summarize') === task.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 border border-white/10 text-muted'
                      }`}
                    >
                      {task.label}
                    </button>
                  ))}
                </div>

                {options.aiTask === 'ask-pdf' && (
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1">Your Question</label>
                    <input
                      type="text"
                      className="input-field w-full text-sm"
                      placeholder="e.g. What are the key findings or deadlines?"
                      value={options.question}
                      onChange={(e) => setOptions({ ...options, question: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcess}
                disabled={processing}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing ({progress}%)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run {tool.name}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Processing Progress Bar ──────────────────────────────────────────── */}
      {processing && (
        <div className="card-depth p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-lime-400 animate-spin mx-auto" />
          <h4 className="text-base font-bold">Processing Document...</h4>
          <p className="text-xs text-muted">Applying transformations with cryptographic precision.</p>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden max-w-md mx-auto">
            <div
              className="bg-lime-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── Error Notification ───────────────────────────────────────────────── */}
      {error && (
        <div className="card-depth p-4 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl flex items-start gap-3 my-4">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Processing Notice</h4>
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* ─── Processing Result Area ───────────────────────────────────────────── */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-depth p-6 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-lime-400" />
              <div>
                <h3 className="text-lg font-bold">Ready for Download</h3>
                <p className="text-xs text-muted">File processed and verified.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Process Another
            </button>
          </div>

          {/* Download card if file output was produced */}
          {result.file && (
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold">{result.file.filename}</p>
                <p className="text-xs text-muted mt-0.5">
                  Size: {formatBytes(result.file.size)} • Type: {result.file.mimeType}
                </p>
                <p className="text-[11px] text-lime-400/80 mt-1">
                  ⚡ Auto-expires in 60 minutes for your privacy.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={result.file.downloadUrl.startsWith('http') ? result.file.downloadUrl : `${apiBase}${result.file.downloadUrl}`}
                  download={result.file.filename}
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download File
                </a>
                <button
                  type="button"
                  onClick={handleCleanup}
                  title="Immediately delete file from server"
                  className="btn-ghost text-xs p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Result Image Preview with Checkerboard Transparency Background */}
          {result.file && result.file.mimeType?.startsWith('image/') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted">Output Preview</span>
                <span className="text-[11px] text-muted">Checkerboard grid shows transparent areas</span>
              </div>
              <div
                className="w-full max-h-96 rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              >
                <img
                  src={result.file.downloadUrl.startsWith('http') ? result.file.downloadUrl : `${apiBase}${result.file.downloadUrl}`}
                  alt="Processed Result"
                  className="max-h-80 max-w-full object-contain rounded-lg shadow-xl"
                />
              </div>
            </div>
          )}

          {/* Structured metadata output */}
          {result.data && !result.data.summary && !result.data.keyPoints && !result.data.answer && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase text-muted">Inspected Metadata</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(result.data).map(([key, val]) => {
                  if (typeof val === 'object' && val !== null) return null;
                  return (
                    <div key={key} className="p-3 rounded-lg bg-black/40 border border-white/10">
                      <p className="text-[11px] uppercase text-muted truncate">{key}</p>
                      <p className="text-sm font-semibold truncate text-white">{String(val)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Palette swatches if present */}
              {Array.isArray(result.data.palette) && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-2">Color Palette Swatches</p>
                  <div className="flex gap-2">
                    {result.data.palette.map((color) => (
                      <div
                        key={color}
                        className="w-10 h-10 rounded-lg border border-white/20 shadow-md flex items-center justify-center text-[10px] font-mono text-white/80"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Intelligence result view */}
          {result.data && (result.data.summary || result.data.keyPoints || result.data.answer || result.data.questions) && (
            <div className="space-y-4">
              {result.data.notice && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
                  {result.data.notice}
                </div>
              )}

              {result.data.summary && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-lime-400">Executive Summary</h4>
                  <p className="text-sm leading-relaxed text-white/90">{result.data.summary}</p>
                </div>
              )}

              {result.data.answer && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-purple-400">Answer</h4>
                  <p className="text-sm leading-relaxed text-white">{result.data.answer}</p>
                </div>
              )}

              {Array.isArray(result.data.keyPoints) && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-lime-400">Key Takeaways</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-white/90">
                    {result.data.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(result.data.questions) && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-purple-400">Study Flashcards</h4>
                  {result.data.questions.map((q) => (
                    <div key={q.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs font-bold text-white mb-1">Q: {q.question}</p>
                      <p className="text-xs text-muted">A: {q.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Client Base64 Output */}
          {result.base64 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted">Base64 Data URI</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.base64);
                    setCopied(true);
                    toast.success('Copied Base64 string to clipboard!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <textarea
                readOnly
                value={result.base64}
                className="input-field w-full font-mono text-xs h-32 select-all"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
