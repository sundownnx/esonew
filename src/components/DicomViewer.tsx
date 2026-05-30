import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Maximize, RefreshCw, ZoomIn, ZoomOut, Move, Ruler, CheckCircle } from 'lucide-react';
import { translations } from '../localization';
import { LanguageCode } from '../types';

interface DicomViewerProps {
  patientName: string;
  slicesCount: number;
  isDarkMode?: boolean;
  lang: LanguageCode;
}

export default function DicomViewer({ patientName, slicesCount = 15, isDarkMode = false, lang }: DicomViewerProps) {
  const t = translations[lang] || translations['en'];
  const [slice, setSlice] = useState<number>(Math.floor(slicesCount / 2));
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rulerActive, setRulerActive] = useState<boolean>(true);
  const [measurements, setMeasurements] = useState<{ p1: { x: number; y: number }; p2?: { x: number; y: number }; length: number }[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawingRuler, setIsDrawingRuler] = useState<boolean>(false);
  const [currentStart, setCurrentStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Redraw mock medical scan slice depending on slice index and filters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and fill dark PACS background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply brightness & contrast filters via standard canvas drawing
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Let's render procedural diagnostic scans
    // We render a skull cross-section for brain MRI, or cardiac cavities for Cardiology
    const sliceRatio = slice / slicesCount;

    // Outer Bone Boundary (glowing gray/white)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    
    ctx.beginPath();
    ctx.arc(0, 0, 75 + sliceRatio * 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Brain hemispheres / Cerebellum lobes / Ventricles (gray levels)
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    // Left Hemisphere
    ctx.arc(-22, -10 + sliceRatio * 5, 30, 0, Math.PI * 2);
    ctx.fill();
    // Right Hemisphere
    ctx.arc(22, -10 + sliceRatio * 5, 30, 0, Math.PI * 2);
    ctx.fill();

    // Posterior Cerebellum details
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(0, 42, 22 - Math.abs(sliceRatio - 0.5) * 10, 0, Math.PI * 2);
    ctx.fill();

    // Inner Ventricles (simulate ventricular fluid, normally very dark or bright depending on resonance T1/T2)
    // Here we simulate a gorgeous glowing green diagnostic highlight for mitral valves or spinal CSF
    ctx.fillStyle = '#0f0f0f';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    // Left Lateral Ventricle
    ctx.ellipse(-12, -8, 8, 18 - sliceRatio * 6, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Lateral Ventricle
    ctx.beginPath();
    ctx.ellipse(12, -8, 8, 18 - sliceRatio * 6, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw localized diagnostic "Lesion" or abnormality representing second opinion trigger!
    // We center a micro circle lesion in neurology scans
    ctx.fillStyle = '#cc2a36';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    // Move tumor or lesion coordinates based on slices
    const lesionX = -35 + sliceRatio * 10;
    const lesionY = -20 + sliceRatio * 5;
    const lesionRadius = 4 + (1.0 - Math.abs(sliceRatio - 0.6) * 4) * 4;
    
    if (lesionRadius > 1.5) {
      ctx.arc(lesionX, lesionY, lesionRadius, 0, Math.PI * 2);
      ctx.fill();
      // Add crosshair cursor mark
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(lesionX - lesionRadius - 6, lesionY);
      ctx.lineTo(lesionX + lesionRadius + 6, lesionY);
      ctx.moveTo(lesionX, lesionY - lesionRadius - 6);
      ctx.lineTo(lesionX, lesionY + lesionRadius + 6);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Grid overlays (standard PACS workstation grids)
    ctx.restore();

    // Draw Static Grids and crosshairs in UI scale
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 25) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Draw any completed manual measurements of mitral valve or focal lesions
    measurements.forEach((m, idx) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      
      // Draw Start Node
      ctx.beginPath();
      ctx.arc(m.p1.x, m.p1.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw End Node and connecting line if present
      if (m.p2) {
        ctx.beginPath();
        ctx.arc(m.p2.x, m.p2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(m.p1.x, m.p1.y);
        ctx.lineTo(m.p2.x, m.p2.y);
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label Text
        ctx.font = '8px monospace';
        const midX = (m.p1.x + m.p2.x) / 2;
        const midY = (m.p1.y + m.p2.y) / 2 - 5;
        ctx.fillText(`M${idx + 1}: ${m.length.toFixed(1)} mm`, midX + 4, midY);
      }
    });

    // Draw active dynamic dragging line
    if (isDrawingRuler && currentStart && mousePos) {
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = '#22c55e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(currentStart.x, currentStart.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(currentStart.x, currentStart.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();

      const dx = mousePos.x - currentStart.x;
      const dy = mousePos.y - currentStart.y;
      const dynamicLen = Math.sqrt(dx * dx + dy * dy) * 0.12; // calibration metric
      ctx.font = '9px monospace';
      ctx.fillText(`${dynamicLen.toFixed(1)} mm`, mousePos.x + 8, mousePos.y - 4);
    }

  }, [slice, brightness, contrast, zoom, pan, measurements, isDrawingRuler, currentStart, mousePos, slicesCount]);

  // Click handler to draw caliper lines
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rulerActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawingRuler) {
      setIsDrawingRuler(true);
      setCurrentStart({ x, y });
      setMousePos({ x, y });
    } else if (currentStart) {
      const dx = x - currentStart.x;
      const dy = y - currentStart.y;
      const length = Math.sqrt(dx * dx + dy * dy) * 0.12; // 0.12 mm per pixel calibration

      setMeasurements([...measurements, { p1: currentStart, p2: { x, y }, length }]);
      setIsDrawingRuler(false);
      setCurrentStart(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRuler) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setIsDrawingRuler(false);
    setCurrentStart(null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.6));
  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    setMeasurements([]);
    setIsDrawingRuler(false);
    setCurrentStart(null);
  };

  return (
    <div className={`rounded-xl p-4 flex flex-col gap-4 shadow-sm border transition-all duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
      {/* PACS Workstation Header Status */}
      <div className={`flex justify-between items-center pb-2 text-[10px] font-mono border-b ${isDarkMode ? 'border-[#22392b] text-gray-400' : 'border-[#E1EDE6] text-gray-500'}`}>
        <div>
          <span className={`font-bold uppercase ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{t.pacsWorkstation}</span>
          <span className="mx-2">|</span>
          <span>{t.pacsPatient}: {patientName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className={`font-bold uppercase text-[9px] ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{t.slaSync}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Side: Interactive Canvas viewer */}
        <div className={`md:col-span-8 flex flex-col justify-center items-center bg-black rounded-lg p-2 border relative overflow-hidden group ${isDarkMode ? 'border-[#22392b]' : 'border-[#BDD1C6]/40'}`}>
          
          {/* Scientific crosshair anchors on viewport border */}
          <div className="absolute top-2 left-2 text-[9px] text-[#D4AF37] font-mono">
            {t.scaleCaliper}: {(zoom * 100).toFixed(0)}% <br/>
            {t.brightnessLabel}: {brightness}%
          </div>

          <div className="absolute top-2 right-2 text-[9px] text-[#D4AF37] font-mono text-right">
            {t.slices}: {slice}/{slicesCount} <br/>
            {t.pacsRuler}: {rulerActive ? t.readyClickMeasure : t.disabled}
          </div>

          <canvas 
            ref={canvasRef}
            width={340}
            height={340}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            className="rounded cursor-crosshair max-w-full"
          />

          {/* Caliper overlay indicators */}
          {measurements.length > 0 && (
            <div className={`absolute bottom-2 left-2 p-2 rounded border text-[9px] font-mono flex flex-col gap-1 max-h-24 overflow-y-auto shadow-md ${isDarkMode ? 'bg-[#0f2116]/95 border-[#D4AF37] text-yellow-250' : 'bg-yellow-50/95 border-[#D4AF37] text-[#7D6608]'}`}>
              <span className={`font-bold border-b pb-0.5 uppercase tracking-wider ${isDarkMode ? 'border-amber-900/40 text-yellow-300' : 'border-yellow-200 text-[#7D6608]'}`}>{t.caliperMetrics}:</span>
              {measurements.map((m, idx) => (
                <div key={idx} className="flex justify-between gap-4">
                  <span>M{idx + 1}:</span>
                  <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{m.length.toFixed(2)} mm</strong>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic slide slider */}
          <div className="w-full flex items-center gap-3 mt-3 px-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">{t.sliceStack}</span>
            <input 
              type="range"
              min="1"
              max={slicesCount}
              value={slice}
              onChange={(e) => setSlice(parseInt(e.target.value))}
              className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <span className={`text-xs font-mono px-2 py-0.5 rounded border font-bold ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-400' : 'bg-[#F4F8F5] border-[#BDD1C6] text-[#004F2D]'}`}>
              {slice}/{slicesCount}
            </span>
          </div>
        </div>

        {/* Right Side: Controllers Toolbar */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          <div className={`border rounded-xl p-4 space-y-4 text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#15241c] border-[#253e2f]' : 'bg-[#F4F8F6] border-[#BDD1C6]/70'}`}>
            <h4 className={`text-[11px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 border-b pb-2 ${isDarkMode ? 'text-[#D4AF37] border-[#253e2f]' : 'text-[#004F2D] border-[#BDD1C6]/40'}`}>
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              {t.pacsCalibration}
            </h4>

            {/* Brightness filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>{t.brightnessLabel}</span>
                <span className={`font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{brightness}%</span>
              </div>
              <input 
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#004F2D]"
              />
            </div>

            {/* Contrast filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>{t.contrastLabel}</span>
                <span className={`font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{contrast}%</span>
              </div>
              <input 
                type="range"
                min="50"
                max="180"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#004F2D]"
              />
            </div>

            {/* Zoom Controls */}
            <div className={`space-y-2 pt-2 border-t ${isDarkMode ? 'border-emerald-900/20' : 'border-[#BDD1C6]/40'}`}>
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">{t.scaleCaliper}</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleZoomIn}
                  className={`py-1.5 px-3 border rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium shadow-sm ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-100 hover:bg-[#1a2d21]' : 'bg-white border-[#BDD1C6] text-gray-700 hover:text-white hover:bg-[#004F2D]'}`}
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {t.scaleUp}
                </button>
                <button 
                  onClick={handleZoomOut}
                  className={`py-1.5 px-3 border rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium shadow-sm ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-100 hover:bg-[#1a2d21]' : 'bg-white border-[#BDD1C6] text-gray-700 hover:text-white hover:bg-[#004F2D]'}`}
                >
                  <ZoomOut className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {t.scaleDown}
                </button>
              </div>
            </div>

            {/* Caliper Action Toolbar */}
            <div className={`pt-2 border-t space-y-2 ${isDarkMode ? 'border-emerald-900/20' : 'border-[#BDD1C6]/40'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase flex items-center gap-1 font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Ruler className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                  {t.slaRulerMeasure}
                </span>
                <span className={`px-1.5 py-0.5 text-[8px] text-white font-mono rounded font-bold uppercase ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}>
                  {t.calibrated}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 leading-normal italic font-medium">
                {t.clickTwiceText}
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={() => setRulerActive(!rulerActive)}
                  className={`py-1.5 px-2 border rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold ${
                    rulerActive 
                    ? (isDarkMode ? 'bg-amber-950/30 border-[#D4AF37] text-amber-300 hover:bg-amber-950/50' : 'bg-yellow-50 border-[#D4AF37] text-[#7D6608] hover:bg-yellow-100') 
                    : (isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-400 hover:bg-[#1d3326]' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50')
                  }`}
                >
                  {rulerActive ? t.caliperActive : t.caliperStopped}
                </button>
                <button 
                  onClick={clearMeasurements}
                  className={`py-1.5 px-2 border rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer font-semibold ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-300 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900' : 'bg-white hover:bg-[#FFF5F5] border border-gray-300 hover:border-rose-300 text-gray-600 hover:text-rose-600'}`}
                >
                  {t.clearCalipers}
                </button>
              </div>
            </div>

            {/* Quick calibration status reset */}
            <button 
              onClick={handleReset}
              className={`w-full py-2 mt-2 border text-xs font-mono rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold shadow-sm ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-[#D4AF37] hover:bg-[#1f3728] hover:border-emerald-700' : 'bg-white border-[#BDD1C6] hover:border-[#004F2D] text-[#004F2D] hover:bg-emerald-50/50'}`}
            >
              <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
              {t.resetPacs}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
