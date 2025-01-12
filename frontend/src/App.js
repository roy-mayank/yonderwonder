import React, { useState } from "react";
import axios from "axios";

export default function MediaProcessor() {
  const [file, setFile] = useState(null);
  const [processedUrl, setProcessedUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [controls, setControls] = useState({
    brightness: 1,
    contrast: 1,
    sharpness: 1,
  });
  //   const [sliderPosition, setSliderPosition] = useState(50);
  //   const [isDragging, setIsDragging] = useState(false);
  //   const containerRef = useRef(null);
  // const handleMouseDown = () => setIsDragging(true);
  //   const handleMouseUp = () => setIsDragging(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("brightness", controls.brightness);
    formData.append("contrast", controls.contrast);
    formData.append("sharpness", controls.sharpness);

    try {
      const response = await axios.post(
        "http://localhost:5000/process-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProcessedUrl(`http://localhost:5000${response.data.processed}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleControlChange = (control) => (e) => {
    setControls((prev) => ({
      ...prev,
      [control]: parseFloat(e.target.value),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="mb-2"
        />

        {error && <div className="text-red-500 mb-2">{error}</div>}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brightness</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={controls.brightness}
              onChange={handleControlChange("brightness")}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contrast</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={controls.contrast}
              onChange={handleControlChange("contrast")}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sharpness</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={controls.sharpness}
              onChange={handleControlChange("sharpness")}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isProcessing ? "Processing..." : "Process Image"}
        </button>
      </div>

      {originalUrl && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Original Image:</h3>
          <img src={originalUrl} alt="Original" className="max-w-full h-auto" />
        </div>
      )}

      {processedUrl && (
        <div>
          <h3 className="font-medium mb-2">Processed Image:</h3>
          <img
            src={processedUrl}
            alt="Processed"
            className="max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
