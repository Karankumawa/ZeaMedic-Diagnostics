document.addEventListener('DOMContentLoaded', () => {
    // Left UI Elements
    const fileInput = document.getElementById('file-input');
    const fileInputChange = document.getElementById('file-input-change');
    const uploadPrompt = document.getElementById('upload-prompt');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeText = document.getElementById('analyze-text');
    const analyzeIcon = document.getElementById('analyze-icon');
    const analyzeShine = document.getElementById('analyze-shine');
    
    // Camera Elements
    const startCameraBtn = document.getElementById('start-camera-btn');
    const cameraUI = document.getElementById('camera-ui');
    const videoElement = document.getElementById('camera-stream');
    const snapBtn = document.getElementById('snap-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const canvas = document.getElementById('snapshot-canvas');
    
    // Right UI Elements
    const placeholderBox = document.getElementById('placeholder-box');
    const loadingBox = document.getElementById('loading-box');
    const resultsContent = document.getElementById('results-content');
    
    // Result Text Elements
    const diseaseNameEl = document.getElementById('disease-name');
    const confidenceScoreEl = document.getElementById('confidence-score');
    const confidenceCircleEl = document.getElementById('confidence-circle');
    const symptomsEl = document.getElementById('symptoms');
    const preventionEl = document.getElementById('prevention');
    const organicEl = document.getElementById('organic');
    const chemicalEl = document.getElementById('chemical');
    const downloadBtn = document.getElementById('download-report-btn');

    let stream = null;
    let imageToUpload = null;
    let base64ImageForPdf = null;
    let isAnalyzing = false;

    // --- Core Logic ---

    function handleFileSelection(file) {
        if (!file) return;
        imageToUpload = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            base64ImageForPdf = e.target.result;
            imagePreview.src = base64ImageForPdf;
            
            // UI transitions
            uploadPrompt.classList.add('hidden');
            imagePreviewContainer.classList.remove('hidden');
            
            enableAnalyzeBtn();
            stopCamera();
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0]));
    fileInputChange.addEventListener('change', (e) => handleFileSelection(e.target.files[0]));

    // Drag and Drop Logic
    const uploadContainer = document.getElementById('upload-container');
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('border-emerald-500', 'bg-emerald-900/10');
    });
    uploadContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('border-emerald-500', 'bg-emerald-900/10');
    });
    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('border-emerald-500', 'bg-emerald-900/10');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    // --- Camera Logic ---

    startCameraBtn.addEventListener('click', async () => {
        if(isAnalyzing) return;
        cameraUI.classList.remove('hidden');
        cameraUI.classList.add('flex');
        startCameraBtn.classList.add('hidden');
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            videoElement.srcObject = stream;
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access denied or unavailable.");
            stopCamera();
        }
    });

    closeCameraBtn.addEventListener('click', stopCamera);

    snapBtn.addEventListener('click', () => {
        if (!stream) return;
        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        base64ImageForPdf = canvas.toDataURL('image/jpeg');
        canvas.toBlob((blob) => {
            imageToUpload = blob;
            imageToUpload.name = "webcam_capture.jpg";
            
            // Set preview UI
            imagePreview.src = base64ImageForPdf;
            uploadPrompt.classList.add('hidden');
            imagePreviewContainer.classList.remove('hidden');
            
            enableAnalyzeBtn();
            stopCamera();
        }, 'image/jpeg');
    });

    function stopCamera() {
        if (stream) { 
            stream.getTracks().forEach(track => track.stop()); 
            stream = null; 
        }
        cameraUI.classList.add('hidden');
        cameraUI.classList.remove('flex');
        startCameraBtn.classList.remove('hidden');
    }

    // --- Analysis Logic ---

    function enableAnalyzeBtn() {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('bg-emerald-900/20', 'text-emerald-600/50', 'cursor-not-allowed');
        analyzeBtn.classList.add('bg-emerald-600', 'text-white', 'hover:bg-emerald-500', 'cursor-pointer');
        analyzeIcon.classList.remove('fa-microchip');
        analyzeIcon.classList.add('fa-wand-magic-sparkles');
        analyzeShine.classList.remove('hidden');
    }

    function disableAnalyzeBtn() {
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('bg-emerald-900/20', 'text-emerald-600/50', 'cursor-not-allowed');
        analyzeBtn.classList.remove('bg-emerald-600', 'text-white', 'hover:bg-emerald-500', 'cursor-pointer');
        analyzeIcon.classList.add('fa-microchip');
        analyzeIcon.classList.remove('fa-wand-magic-sparkles');
        analyzeShine.classList.add('hidden');
    }

    function formatTextToHtml(text) {
        if(!text) return "";
        if(Array.isArray(text)) text = text.join('\\n');
        text = String(text); // Ensure it's a string
        // Simple Markdown-style replacement (e.g. bolding)
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        // Handle line breaks
        html = html.replace(/\n/g, '<br/>');
        return html;
    }

    analyzeBtn.addEventListener('click', async () => {
        if (!imageToUpload || isAnalyzing) return;
        
        isAnalyzing = true;
        disableAnalyzeBtn();
        analyzeText.textContent = "Analyzing Topology...";
        analyzeIcon.className = "fa-solid fa-sync fa-spin";

        // UI transitions right column
        placeholderBox.classList.add('hidden');
        resultsContent.classList.add('hidden');
        loadingBox.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('image', imageToUpload, imageToUpload.name);

        try {
             // Timeout simulation for smoother UX if prediction is too fast
            const startTime = Date.now();
            const response = await fetch('/api/predict', { method: 'POST', body: formData });
            const result = await response.json();
            
            const elapsed = Date.now() - startTime;
            if(elapsed < 2000) {
                await new Promise(r => setTimeout(r, 2000 - elapsed));
            }
            
            loadingBox.classList.add('hidden');

            if (result.success) {
                diseaseNameEl.innerText = result.predicted_class;
                
                // Animate confidence
                const confScore = Math.round(result.confidence);
                let currentScore = 0;
                confidenceScoreEl.innerText = currentScore;
                
                // Calculate dasharray for circle (circumference is 100 in our viewBox setup)
                setTimeout(() => {
                   confidenceCircleEl.setAttribute('stroke-dasharray', `${confScore}, 100`);
                }, 100);

                const interval = setInterval(() => {
                    if (currentScore >= confScore) {
                        clearInterval(interval);
                    } else {
                        currentScore++;
                        confidenceScoreEl.innerText = currentScore;
                    }
                }, 10);
                
                symptomsEl.innerHTML = formatTextToHtml(result.plan.symptoms);
                preventionEl.innerHTML = formatTextToHtml(result.plan.prevention);
                if(organicEl) organicEl.innerHTML = formatTextToHtml(result.plan.organic);
                if(chemicalEl) chemicalEl.innerHTML = formatTextToHtml(result.plan.chemical);
                
                resultsContent.classList.remove('hidden');
                resultsContent.classList.add('flex');
                
                window.currentPredictionData = result; 
            } else { 
                alert("Diagnostics Failed: " + result.error); 
                placeholderBox.classList.remove('hidden');
            }
        } catch (error) { 
            console.error(error); 
            alert("Network Error Connecting to AI Matrix."); 
            loadingBox.classList.add('hidden');
            placeholderBox.classList.remove('hidden');
        }
        
        isAnalyzing = false;
        analyzeText.textContent = "Re-Run Diagnostics";
        analyzeIcon.className = "fa-solid fa-rotate-right";
        enableAnalyzeBtn();
    });

    // --- PDF Download logic ---

    downloadBtn.addEventListener('click', async () => {
        if (!window.currentPredictionData) return;
        
        const originalContent = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-gray-400"></i> Compile Data Block...';
        
        try {
            const payload = { ...window.currentPredictionData, image_base64: base64ImageForPdf };
            const response = await fetch('/api/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("PDF Synthesis failed");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CornDoctor_Report_${window.currentPredictionData.predicted_class.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { 
            console.error(e);
            alert("Extrication Error: Could not generate PDF"); 
        }
        
        downloadBtn.innerHTML = originalContent;
    });
});
