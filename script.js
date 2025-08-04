const imageUpload = document.getElementById("imageUpload"),
      uploadedImage = document.getElementById("uploadedImage"),
      imageContainer = document.getElementById("imageContainer"),
      topTextInput = document.getElementById("topTextInput"),
      bottomTextInput = document.getElementById("bottomTextInput"),
      topTextOverlay = document.getElementById("topText"),
      bottomTextOverlay = document.getElementById("bottomText"),
      saveImageBtn = document.getElementById("saveImage"),
      fontSizeSlider = document.getElementById("fontSize"),
      fontSizeValue = document.getElementById("fontSizeValue"),
      textShadowCheckbox = document.getElementById("textShadow"),
      controls = document.querySelector(".controls"),
      draftList = document.getElementById("draftList"),
      saveDraftBtn = document.getElementById("saveDraft"),
      loadDraftBtn = document.getElementById("loadDraft"),
      clearDraftBtn = document.getElementById("clearDraft"),
      addNewBtn = document.getElementById("addNew");

let currentScale = 1, currentX = 0, currentY = 0;

function resetEditor() {
    topTextInput.value = "";
    bottomTextInput.value = "";
    fontSizeSlider.value = 14;
    fontSizeValue.textContent = "14px";
    textShadowCheckbox.checked = false;
    uploadedImage.src = "";
    topTextOverlay.innerHTML = "";
    bottomTextOverlay.innerHTML = "";
    resetImagePosition();
}

function resetImagePosition() {
    currentScale = 1;
    currentX = 0;
    currentY = 0;
    updateImageTransform();
}

function updateImageTransform() {
    uploadedImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
}

function updateTextOverlay(e, t) {
    let lines = e.value.split("\n").slice(0, 6);  // Limit to 6 lines
    t.innerHTML = "";  // Clear existing text
    lines.forEach(line => {
        let p = document.createElement("p");
        if (line.startsWith("*")) {
            p.classList.add("special");
        }
        p.textContent = line;
        p.style.fontSize = `${fontSizeSlider.value}px`;
        if (textShadowCheckbox.checked) {
            p.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 4px 3px rgba(0,0,0,1)";
        }
        t.appendChild(p);
    });
}

function saveDraft() {
    let draftTitle = prompt("Masukkan judul draft:");
    if (draftTitle) {
        let draft = {
            topText: topTextInput.value,
            bottomText: bottomTextInput.value,
            fontSize: fontSizeSlider.value,
            textShadow: textShadowCheckbox.checked,
            imageSrc: uploadedImage.src
        };
        localStorage.setItem(`imageEditorDraft_${draftTitle}`, JSON.stringify(draft));
        alert(`Draft "${draftTitle}" telah disimpan!`);
        populateDraftList();
    } else {
        alert("Judul draft tidak boleh kosong.");
    }
}

function populateDraftList() {
    draftList.innerHTML = '<option value="" disabled selected>Pilih Draft</option>';
    let drafts = Object.keys(localStorage).filter(key => key.startsWith("imageEditorDraft_"))
                                        .map(key => key.replace("imageEditorDraft_", ""));
    drafts.forEach(draft => {
        let option = document.createElement("option");
        option.value = draft;
        option.textContent = draft;
        draftList.appendChild(option);
    });
}

function loadDraft() {
    let selectedDraft = draftList.value;
    if (!selectedDraft) {
        alert("Silakan pilih draft untuk dimuat.");
        return;
    }
    let draft = JSON.parse(localStorage.getItem(`imageEditorDraft_${selectedDraft}`));
    if (draft) {
        topTextInput.value = draft.topText || "";
        bottomTextInput.value = draft.bottomText || "";
        fontSizeSlider.value = draft.fontSize || 14;
        fontSizeValue.textContent = `${draft.fontSize}px`;
        textShadowCheckbox.checked = draft.textShadow || false;
        uploadedImage.src = draft.imageSrc || "";
        updateTextOverlay(topTextInput, topTextOverlay);
        updateTextOverlay(bottomTextInput, bottomTextOverlay);
        alert(`Draft "${selectedDraft}" telah dimuat!`);
    } else {
        alert("Draft tidak ditemukan.");
    }
}

function clearDraft() {
    let selectedDraft = draftList.value;
    if (!selectedDraft) {
        alert("Silakan pilih draft untuk dihapus.");
        return;
    }
    if (localStorage.getItem(`imageEditorDraft_${selectedDraft}`)) {
        localStorage.removeItem(`imageEditorDraft_${selectedDraft}`);
        alert(`Draft "${selectedDraft}" telah dihapus!`);
        populateDraftList();
    } else {
        alert("Draft tidak ditemukan.");
    }
}

imageUpload.addEventListener("change", function(e) {
    let file = e.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            resetImagePosition();
        };
        reader.readAsDataURL(file);
    }
});

addNewBtn.addEventListener("click", resetEditor);
saveDraftBtn.addEventListener("click", saveDraft);
loadDraftBtn.addEventListener("click", loadDraft);
clearDraftBtn.addEventListener("click", clearDraft);
window.addEventListener("load", populateDraftList);

topTextInput.addEventListener("input", () => updateTextOverlay(topTextInput, topTextOverlay));
bottomTextInput.addEventListener("input", () => updateTextOverlay(bottomTextInput, bottomTextOverlay));

fontSizeSlider.addEventListener("input", function() {
    fontSizeValue.textContent = `${this.value}px`;
    updateTextOverlay(topTextInput, topTextOverlay);
    updateTextOverlay(bottomTextInput, bottomTextOverlay);
});

textShadowCheckbox.addEventListener("change", function() {
    updateTextOverlay(topTextInput, topTextOverlay);
    updateTextOverlay(bottomTextInput, bottomTextOverlay);
});

document.getElementById("zoomIn").addEventListener("click", () => {
    currentScale = Math.min(3, currentScale + 0.1);
    updateImageTransform();
});

document.getElementById("zoomOut").addEventListener("click", () => {
    currentScale = Math.max(0.5, currentScale - 0.1);
    updateImageTransform();
});

document.getElementById("moveUp").addEventListener("click", () => {
    currentY += 10;
    updateImageTransform();
});

document.getElementById("moveDown").addEventListener("click", () => {
    currentY -= 10;
    updateImageTransform();
});

document.getElementById("moveLeft").addEventListener("click", () => {
    currentX += 10;
    updateImageTransform();
});

document.getElementById("moveRight").addEventListener("click", () => {
    currentX -= 10;
    updateImageTransform();
});

document.getElementById("resetPosition").addEventListener("click", resetImagePosition);

saveImageBtn.addEventListener("click", function() {
    controls.style.display = "none";
    html2canvas(imageContainer, { scale: 3, useCORS: true }).then(canvas => {
        controls.style.display = "grid";
        let tCanvas = document.createElement("canvas");
        let ctx = tCanvas.getContext("2d");
        tCanvas.width = 800;
        tCanvas.height = 600;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        let n = canvas;
        for (let i = 0; i < 3; i++) {
            let o = canvas.width * Math.pow(0.8, i + 1);
            let l = canvas.height * Math.pow(0.8, i + 1);
            let subCanvas = document.createElement("canvas");
            subCanvas.width = o;
            subCanvas.height = l;
            let subCtx = subCanvas.getContext("2d");
            subCtx.imageSmoothingEnabled = true;
            subCtx.imageSmoothingQuality = "high";
            subCtx.drawImage(n, 0, 0, o, l);
            n = subCanvas;
        }

        ctx.drawImage(n, 0, 0, tCanvas.width, tCanvas.height);

        tCanvas.toBlob(function(blob) {
            let link = document.createElement("a");
            link.download = "ORCA-SSRP.png";
            link.href = URL.createObjectURL(blob);
            link.click();
        }, "image/png");
    });
});
