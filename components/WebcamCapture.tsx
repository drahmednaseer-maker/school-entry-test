'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface WebcamCaptureProps {
    onCapture: (base64: string) => void;
    onClear: () => void;
    capturedPhoto: string | null;
}

export default function WebcamCapture({ onCapture, onClear, capturedPhoto }: WebcamCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState('');

    // Live preview: wider to show full camera (no black bars)
    const PREVIEW_W = 340;
    const PREVIEW_H = 255; // ~4:3

    // Output: passport size 3:4
    const OUT_W = 280;
    const OUT_H = 360;

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
        }
    }, [stream, streaming]);

    useEffect(() => {
        return () => { stream?.getTracks().forEach(t => t.stop()); };
    }, [stream]);

    const startCamera = useCallback(async () => {
        setError('');
        try {
            let s: MediaStream;
            try {
                s = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: false,
                });
            } catch {
                s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }
            setStream(s);
            setStreaming(true);
        } catch (err: any) {
            if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Click the camera icon in your browser address bar → Allow, then try again.');
            } else if (err?.name === 'NotFoundError') {
                setError('No webcam detected. Please connect a webcam and try again.');
            } else if (err?.name === 'NotReadableError') {
                setError('Webcam is busy. Close other apps using it (Zoom, Meet, etc.) and try again.');
            } else {
                setError(`Webcam error: ${err?.message || err?.name || 'Unknown'}.`);
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
        setStreaming(false);
    }, [stream]);

    const capture = useCallback(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;

        // Take a center portrait crop from the landscape frame
        // Crop height = full video height; crop width = height × (3/4) for portrait
        const cropH = vh;
        const cropW = Math.round(vh * (OUT_W / OUT_H));
        const sx = Math.max(0, (vw - cropW) / 2);
        const sy = 0;

        canvas.width = OUT_W;
        canvas.height = OUT_H;
        const ctx = canvas.getContext('2d')!;

        // Mirror (selfie style)
        ctx.save();
        ctx.translate(OUT_W, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, OUT_W, OUT_H);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCapture(dataUrl);
        stopCamera();
    }, [onCapture, stopCamera]);

    const retake = useCallback(() => {
        onClear();
        startCamera();
    }, [onClear, startCamera]);

    // Oval guide dimensions on the PREVIEW (maps to passport crop zone)
    // The oval indicates where the face should be within the center-portrait crop
    const ovalCX = PREVIEW_W / 2;
    const ovalCY = PREVIEW_H * 0.46;
    const ovalRX = (PREVIEW_W * (OUT_W / PREVIEW_W)) * 0.38;
    const ovalRY = PREVIEW_H * 0.43;

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Student Photo{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(passport size)</span>
            </label>

            {/* Captured photo preview */}
            {capturedPhoto && !streaming && (
                <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={capturedPhoto}
                        alt="Passport Photo"
                        style={{
                            width: `${OUT_W / 2}px`,
                            height: `${OUT_H / 2}px`,
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '2px solid var(--primary)',
                        }}
                    />
                    <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>✓ Photo captured</p>
                        <button type="button" onClick={retake} className="st-btn-ghost text-xs px-3 py-2">
                            <RefreshCw size={13} /> Retake
                        </button>
                        <button type="button" onClick={onClear} className="block text-xs pt-1" style={{ color: 'var(--danger)' }}>
                            Remove photo
                        </button>
                    </div>
                </div>
            )}

            {/* Live camera feed — landscape container, no black bars */}
            {streaming && (
                <div className="space-y-3">
                    <div
                        className="relative overflow-hidden rounded-2xl"
                        style={{
                            width: `${PREVIEW_W}px`,
                            height: `${PREVIEW_H}px`,
                            background: '#111',
                            border: '2px solid var(--primary)',
                            boxShadow: '0 0 0 4px var(--primary-muted)',
                        }}
                    >
                        {/* Full-frame mirrored video — fills container with no black bars */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)',
                            }}
                        />

                        {/* SVG oval guide — shows passport crop zone */}
                        <svg
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                            viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <mask id="ovalMaskPrev">
                                    <rect width={PREVIEW_W} height={PREVIEW_H} fill="white" />
                                    <ellipse cx={ovalCX} cy={ovalCY} rx={ovalRX} ry={ovalRY} fill="black" />
                                </mask>
                            </defs>
                            {/* Dark mask outside oval */}
                            <rect width={PREVIEW_W} height={PREVIEW_H} fill="rgba(0,0,0,0.45)" mask="url(#ovalMaskPrev)" />
                            {/* Oval border */}
                            <ellipse
                                cx={ovalCX} cy={ovalCY} rx={ovalRX} ry={ovalRY}
                                fill="none"
                                stroke="rgba(255,255,255,0.9)"
                                strokeWidth="2"
                                strokeDasharray="8 4"
                            />
                            {/* Corner brackets for premium feel */}
                            <path d={`M ${ovalCX - ovalRX - 8} ${ovalCY - ovalRY + 12} L ${ovalCX - ovalRX - 8} ${ovalCY - ovalRY - 8} L ${ovalCX - ovalRX + 12} ${ovalCY - ovalRY - 8}`} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                            <path d={`M ${ovalCX + ovalRX + 8} ${ovalCY - ovalRY + 12} L ${ovalCX + ovalRX + 8} ${ovalCY - ovalRY - 8} L ${ovalCX + ovalRX - 12} ${ovalCY - ovalRY - 8}`} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                            <path d={`M ${ovalCX - ovalRX - 8} ${ovalCY + ovalRY - 12} L ${ovalCX - ovalRX - 8} ${ovalCY + ovalRY + 8} L ${ovalCX - ovalRX + 12} ${ovalCY + ovalRY + 8}`} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                            <path d={`M ${ovalCX + ovalRX + 8} ${ovalCY + ovalRY - 12} L ${ovalCX + ovalRX + 8} ${ovalCY + ovalRY + 8} L ${ovalCX + ovalRX - 12} ${ovalCY + ovalRY + 8}`} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                            {/* Hint text */}
                            <text x={PREVIEW_W / 2} y={PREVIEW_H - 10} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.75)" fontFamily="system-ui, sans-serif" fontWeight="600">
                                Center face in oval · image will be cropped to passport size
                            </text>
                        </svg>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="flex gap-2" style={{ width: `${PREVIEW_W}px` }}>
                        <button type="button" onClick={capture} className="st-btn-primary text-sm flex-1 py-2.5">
                            <Camera size={15} /> Capture Passport Photo
                        </button>
                        <button type="button" onClick={stopCamera} className="st-btn-ghost text-sm px-4 py-2.5">
                            <X size={15} />
                        </button>
                    </div>
                </div>
            )}

            {!streaming && <canvas ref={canvasRef} className="hidden" />}

            {!streaming && !capturedPhoto && (
                <button type="button" onClick={startCamera} className="st-btn-ghost text-sm px-4 py-2">
                    <Camera size={15} /> Open Webcam
                </button>
            )}

            {error && (
                <p className="text-xs p-3 rounded-lg leading-relaxed" style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
