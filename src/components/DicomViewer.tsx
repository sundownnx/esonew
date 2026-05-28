import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Maximize, RefreshCw, ZoomIn, ZoomOut, Move, Ruler, CheckCircle } from 'lucide-react';

interface DicomViewerProps {
  patientName: string;
  slicesCount: number;
}

export default function DicomViewer({ patientName, slicesCount = 15 }: DicomViewerProps) {
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
    <div className="bg-white rounded-xl border border-[#BDD1C6]/60 p-4 flex flex-col gap-4 shadow-sm">
      {/* PACS Workstation Header Status */}
      <div className="flex justify-between items-center border-b border-[#E1EDE6] pb-2 text-[10px] font-mono text-gray-500">
        <div>
          <span className="text-[#004F2D] font-bold">PACS WORKSTATION v4.11</span>
          <span className="mx-2">|</span>
          <span>PATIENT: {patientName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-[#004F2D] font-bold uppercase text-[9px]">SLA SYNC ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Side: Interactive Canvas viewer */}
        <div className="md:col-span-8 flex flex-col justify-center items-center bg-black rounded-lg p-2 border border-[#BDD1C6]/40 relative overflow-hidden group">
          
          {/* Scientific crosshair anchors on viewport border */}
          <div className="absolute top-2 left-2 text-[9px] text-[#D4AF37] font-mono">
            ZOOM: {(zoom * 100).toFixed(0)}% <br/>
            BRIGHTNESS: {brightness}%
          </div>

          <div className="absolute top-2 right-2 text-[9px] text-[#D4AF37] font-mono text-right">
            Slices: {slice}/{slicesCount} <br/>
            SLA RULER: {rulerActive ? 'READY (CLICK ON LESIONS TO MEASURE)' : 'DISABLED'}
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
            <div className="absolute bottom-2 left-2 bg-yellow-50/95 p-2 rounded border border-[#D4AF37] text-[9px] font-mono text-[#7D6608] flex flex-col gap-1 max-h-24 overflow-y-auto shadow-md">
              <span className="font-bold border-b border-yellow-200 pb-0.5 uppercase tracking-wider">Caliper Metrics (mm):</span>
              {measurements.map((m, idx) => (
                <div key={idx} className="flex justify-between gap-4">
                  <span>M{idx + 1}:</span>
                  <strong className="text-gray-950 font-bold">{m.length.toFixed(2)} mm</strong>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic slide slider */}
          <div className="w-full flex items-center gap-3 mt-3 px-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Slice stack</span>
            <input 
              type="range"
              min="1"
              max={slicesCount}
              value={slice}
              onChange={(e) => setSlice(parseInt(e.target.value))}
              className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <span className="text-xs font-mono text-[#004F2D] bg-[#F4F8F5] px-2 py-0.5 rounded border border-[#BDD1C6] font-bold">
              {slice}/{slicesCount}
            </span>
          </div>
        </div>

        {/* Right Side: Controllers Toolbar */}
        <div className="md:col-span-4 flex flex-col gap-4">
          
          <div className="bg-[#F4F8F6] border border-[#BDD1C6]/70 rounded-xl p-4 space-y-4 text-left">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5 border-b border-[#BDD1C6]/40 pb-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              PACS Calibration
            </h4>

            {/* Brightness filter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Window Level (Brightness)</span>
                <span className="font-bold text-[#004F2D]">{brightness}%</span>
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
                <span>Window Width (Contrast)</span>
                <span className="font-bold text-[#004F2D]">{contrast}%</span>
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
            <div className="space-y-2 pt-2 border-t border-[#BDD1C6]/40">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">Scale & Caliper</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleZoomIn}
                  className="py-1.5 px-3 bg-white border border-[#BDD1C6] rounded-lg text-[10px] text-gray-700 hover:text-white hover:bg-[#004F2D] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium shadow-sm"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Scale Up
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="py-1.5 px-3 bg-white border border-[#BDD1C6] rounded-lg text-[10px] text-gray-700 hover:text-white hover:bg-[#004F2D] flex items-center justify-center gap-1.5 transition-all cursor-pointer font-medium shadow-sm"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Scale Down
                </button>
              </div>
            </div>

            {/* Caliper Action Toolbar */}
            <div className="pt-2 border-t border-[#BDD1C6]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600 uppercase flex items-center gap-1 font-bold">
                  <Ruler className="w-3.5 h-3.5 text-[#004F2D]" />
                  SLA RULER MEASURE (2D)
                </span>
                <span className="px-1.5 py-0.5 text-[8px] bg-[#004F2D] text-white font-mono rounded font-bold uppercase">
                  Calibrated
                </span>
              </div>
              <p className="text-[9px] text-gray-500 leading-normal italic font-medium">
                Click twice on the slice view to record cardiac mitral valve leaks or neurological cortical thickness in millimeters.
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  onClick={() => setRulerActive(!rulerActive)}
                  className={`py-1.5 px-2 border rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold ${
                    rulerActive 
                    ? 'bg-yellow-50 border-[#D4AF37] text-[#7D6608] hover:bg-yellow-100' 
                    : 'bg-white border-gray-350 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {rulerActive ? 'Caliper Active' : 'Caliper Stopped'}
                </button>
                <button 
                  onClick={clearMeasurements}
                  className="py-1.5 px-2 bg-white hover:bg-[#FFF5F5] border border-gray-300 hover:border-rose-300 text-gray-600 hover:text-rose-600 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer font-semibold"
                >
                  Clear Calipers
                </button>
              </div>
            </div>

            {/* Quick calibration status reset */}
            <button 
              onClick={handleReset}
              className="w-full py-2 mt-2 bg-white border border-[#BDD1C6] hover:border-[#004F2D] text-xs text-[#004F2D] font-mono rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-50/50 transition-colors cursor-pointer font-bold shadow-sm"
            >
              <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
              Reset PACS Parameters
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
