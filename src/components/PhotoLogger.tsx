import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Sparkles, Check, Flame, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { MealLog } from "../types";

interface PhotoLoggerProps {
  onMealAdded: (meal: Omit<MealLog, "id" | "timestamp">) => void;
}

export default function PhotoLogger({ onMealAdded }: PhotoLoggerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setIsCameraActive(true);
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access failed", err);
      setErrorMessage("Could not launch camera feed. Please drop or select an image file instead!");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage("Only image files are permitted.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    stopCamera();
  };

  const runVisionAnalysis = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const match = selectedImage.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Invalid image source file choice.");
      }
      
      const mimeType = match[1];
      const imageBase64 = match[2];

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Analysis request failed.");
      }

      const parsedJSON = await response.json();
      setAnalysisResult(parsedJSON);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Could not parse nutrients. Try again with a clearer image composition.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAddMeal = () => {
    if (analysisResult) {
      onMealAdded({
        foodName: analysisResult.foodName,
        calories: Number(analysisResult.calories) || 0,
        protein: Number(analysisResult.protein) || 0,
        carbs: Number(analysisResult.carbs) || 0,
        fat: Number(analysisResult.fat) || 0,
        fiber: Number(analysisResult.fiber) || 0,
        confidence: Number(analysisResult.confidence) || 0.9,
        description: analysisResult.description,
        suggestions: analysisResult.suggestions,
        imageUrl: selectedImage || undefined,
      });
      resetSelection();
    }
  };

  return (
    <div id="photo-logger-root" className="bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#20212b] border border-[#2c2d3a] flex items-center justify-center">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-extrabold text-white">Visual Plate Scan</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">Isolate food markers automatically using Gemini Vision</p>
        </div>
        
        {selectedImage && (
          <button
            type="button"
            onClick={resetSelection}
            className="text-xs font-bold text-rose-455 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition border border-rose-500/20 text-rose-400"
          >
            Clear Selected
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-450 text-rose-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Drag and Drop Panel */}
      {!selectedImage && !isCameraActive && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition min-h-[220px] ${
            dragActive ? "border-emerald-400 bg-emerald-500/5" : "border-[#2c2d3a] hover:border-emerald-400/30 bg-[#121319]/80"
          }`}
        >
          <div className="p-4 bg-[#20212c] border border-[#2c2d3a] rounded-full mb-3 text-gray-400">
            <ImageIcon className="w-7 h-7 text-emerald-450 text-emerald-400" />
          </div>
          
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Click to Snap or Drag Food Picture</h4>
          <p className="text-[11px] text-gray-400 max-w-xs mb-5 leading-normal">
            Dr. Gemini analyzes portion sizes, compiles caloric distribution, macros and offers daily dynamic recommendations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl shadow-lg transition flex items-center gap-1 text-xs"
            >
              <Camera className="w-4 h-4" /> Start Device Cam
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-[#1f202a] hover:bg-[#252735] text-white font-bold rounded-xl transition border border-[#2e3143] flex items-center gap-1 text-xs"
            >
              <Upload className="w-4 h-4" /> Browse Meals
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={fileSelected}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* Active Camera feed box */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border border-[#2c2d3a]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5 text-xs"
            >
              <Sparkles className="w-4 h-4" /> Capture Snippet
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2.5 bg-black/80 hover:bg-black text-white font-bold rounded-xl transition text-xs border border-white/20"
            >
              Close Feed
            </button>
          </div>
        </div>
      )}

      {/* Selected Preview Column */}
      {selectedImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="relative rounded-2xl overflow-hidden bg-[#111217] border border-[#2c2d3a] shadow-inner group">
            <img
              src={selectedImage}
              alt="Meal captured"
              className="w-full h-auto max-h-[280px] object-cover mx-auto"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3.5" />
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Deconstructing macro layers...</span>
                <span className="text-[9px] text-gray-400 mt-1 max-w-[200px] text-center font-mono">Gemini Vision parsing nutritional counts</span>
              </div>
            )}
            
            {/* Visual scanned animated bar */}
            {analyzing && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-line" />
            )}
          </div>

          <div className="space-y-4 text-left">
            {!analysisResult && !analyzing && (
              <div className="space-y-4 min-h-[180px] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Visual Snapshot Logged</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Proceed with analysis. We'll identify dietary macros (carbohydrate, fats, dietary fiber, nitrogen equivalents) in a few seconds.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={runVisionAnalysis}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 fill-black" /> Run Gemini Scan & Compile
                </button>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-3.5 text-left p-4 bg-[#111217]/60 rounded-2xl border border-[#2c2d3a]">
                <div className="border-b border-[#232530] pb-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Identified Snapshot</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">{analysisResult.foodName}</h4>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    <span>{Math.round(analysisResult.confidence * 100)}% Match</span>
                  </div>
                </div>

                {/* Grid stats overview matching mockup dark colors */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#1b1c23] border border-[#2c2d3a] rounded-xl p-2">
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">energy</div>
                    <div className="font-mono font-black text-rose-400 mt-1 flex items-center justify-center gap-0.5 text-xs">
                      <Flame className="w-3.5 h-3.5 text-rose-455 text-rose-400" />
                      {analysisResult.calories} <span className="text-[8px] font-medium text-gray-400">kcal</span>
                    </div>
                  </div>
                  <div className="bg-[#1b1c23] border border-[#2c2d3a] rounded-xl p-2">
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">protein</div>
                    <div className="font-mono font-bold text-white mt-1 text-xs">{analysisResult.protein}g</div>
                  </div>
                  <div className="bg-[#1b1c23] border border-[#2c2d3a] rounded-xl p-2">
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">carbs</div>
                    <div className="font-mono font-bold text-white mt-1 text-xs">{analysisResult.carbs}g</div>
                  </div>
                  <div className="bg-[#1b1c23] border border-[#2c2d3a] rounded-xl p-2">
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">fat</div>
                    <div className="font-mono font-bold text-white mt-1 text-xs">{analysisResult.fat}g</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Description</h5>
                  <p className="text-[11px] text-gray-300 leading-normal">{analysisResult.description}</p>
                </div>

                <div className="space-y-1 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <h5 className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">Nutritionist Advise</h5>
                  <p className="text-[11px] text-emerald-350 text-gray-300 leading-normal">{analysisResult.suggestions}</p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddMeal}
                  className="w-full py-2.5 bg-emerald-450 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl transition duration-200 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" /> Add strictly to daily meal log
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
