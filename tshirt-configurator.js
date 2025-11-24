// T-shirt templates
const TSHIRT_TEMPLATES = {
  white: {
    front:
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    back: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=800&q=80",
  },
  black: {
    front:
      "https://images.unsplash.com/photo-1503341455253-b2cd399ece10?auto=format&fit=crop&w=800&q=80",
    back: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
  },
  navy: {
    front:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    back: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
  },
  gray: {
    front:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    back: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=800&q=80",
  },
  red: {
    front:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    back: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
  },
};

// Default design area bounds (percentage of shirt width/height)
const DESIGN_AREA_BOUNDS = {
  front: {
    top: 0.25, // 25% from top
    left: 0.25, // 25% from left
    width: 0.5, // 50% of shirt width
    height: 0.4, // 40% of shirt height
  },
  back: {
    top: 0.25,
    left: 0.25,
    width: 0.5,
    height: 0.4,
  },
};

// Global variables
let canvas;
let currentTshirt = "white";
let currentSide = "front";
let currentDesign = null;
let designPosition = { x: 0, y: 0 };
let designScale = 1;
let designRotation = 0;
let designArea;
let tshirtImage;

// Initialize the configurator when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeConfigurator();
  setupEventListeners();
  setupRevealAnimations();
});

// Initialize the configurator canvas
function initializeConfigurator() {
  // Create canvas instance
  canvas = new fabric.Canvas("tshirtCanvas", {
    width: 500,
    height: 600,
    backgroundColor: "#f8f9fa",
  });

  // Load the initial t-shirt (white, front)
  loadTshirtTemplate(currentTshirt, currentSide);

  // Create design area indicator
  createDesignArea();

  // Update order summary
  updateOrderSummary();
}

// Load t-shirt template image
function loadTshirtTemplate(color, side) {
  // Clear existing t-shirt if any
  if (tshirtImage) {
    canvas.remove(tshirtImage);
  }

  // Get template URL based on color and side
  const templateUrl = TSHIRT_TEMPLATES[color][side];

  // Load the image
  fabric.Image.fromURL(
    templateUrl,
    function (img) {
      // Resize to fit canvas
      const scale = Math.min(
        (canvas.width / img.width) * 0.9,
        (canvas.height / img.height) * 0.9
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvas.width / 2,
        top: canvas.height / 2,
        selectable: false,
        hoverCursor: "default",
      });

      // Add to canvas
      tshirtImage = img;
      canvas.add(tshirtImage);
      canvas.sendToBack(tshirtImage);

      // Update design area
      updateDesignArea();

      // If there's a design, place it correctly
      if (currentDesign) {
        positionDesignOnShirt();
      }

      canvas.renderAll();
    },
    { crossOrigin: "anonymous" }
  );
}

// Create design area indicator
function createDesignArea() {
  const bounds = DESIGN_AREA_BOUNDS[currentSide];
  const width = canvas.width * bounds.width;
  const height = canvas.height * bounds.height;

  designArea = new fabric.Rect({
    left: canvas.width * bounds.left + width / 2,
    top: canvas.height * bounds.top + height / 2,
    width: width,
    height: height,
    fill: "transparent",
    stroke: "#5655b1",
    strokeWidth: 1,
    strokeDashArray: [5, 5],
    originX: "center",
    originY: "center",
    selectable: false,
    hoverCursor: "default",
  });

  canvas.add(designArea);
  canvas.renderAll();
}

// Update design area when changing t-shirt side
function updateDesignArea() {
  const bounds = DESIGN_AREA_BOUNDS[currentSide];
  const width = canvas.width * bounds.width;
  const height = canvas.height * bounds.height;

  designArea.set({
    left: canvas.width * bounds.left + width / 2,
    top: canvas.height * bounds.top + height / 2,
    width: width,
    height: height,
  });

  canvas.renderAll();
}

// Setup event listeners for the configurator controls
function setupEventListeners() {
  // Color selection
  document.getElementById("color").addEventListener("change", function (e) {
    currentTshirt = e.target.value;
    loadTshirtTemplate(currentTshirt, currentSide);
    updateOrderSummary();
  });

  // Side toggle (front/back)
  document.getElementById("toggleSide").addEventListener("click", function () {
    currentSide = currentSide === "front" ? "back" : "front";
    document.getElementById("sideIndicator").textContent =
      currentSide === "front" ? "Вид спереди" : "Вид сзади";
    loadTshirtTemplate(currentTshirt, currentSide);
  });

  // File upload
  document
    .getElementById("designFile")
    .addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        handleDesignUpload(file);
      }
    });

  // Drag and drop for design upload
  const uploadArea = document.getElementById("uploadArea");

  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", function () {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleDesignUpload(file);
    }
  });

  // Click to upload
  document.querySelector(".upload-link").addEventListener("click", function () {
    document.getElementById("designFile").click();
  });

  // Design controls
  document
    .getElementById("designScale")
    .addEventListener("input", function (e) {
      updateDesignScale(parseFloat(e.target.value));
    });

  document
    .getElementById("designRotation")
    .addEventListener("input", function (e) {
      updateDesignRotation(parseInt(e.target.value));
    });

  // Button actions
  document
    .getElementById("centerDesign")
    .addEventListener("click", centerDesign);
  document.getElementById("resetDesign").addEventListener("click", resetDesign);
  document
    .getElementById("removeDesign")
    .addEventListener("click", removeDesign);
}

// Handle design file upload
function handleDesignUpload(file) {
  if (!file) return;

  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    alert("Пожалуйста, загрузите изображение в формате JPG, PNG или SVG");
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Размер файла не должен превышать 5MB");
    return;
  }

  // Read and load the file
  const reader = new FileReader();
  reader.onload = function (e) {
    // Remove existing design if any
    if (currentDesign) {
      canvas.remove(currentDesign);
    }

    // Create image object
    fabric.Image.fromURL(e.target.result, function (img) {
      // Scale down if too large
      const maxSize = 200;
      if (img.width > maxSize || img.height > maxSize) {
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        img.scale(scale);
      }

      // Set properties
      img.set({
        left: designArea.left,
        top: designArea.top,
        originX: "center",
        originY: "center",
        cornerColor: "#5655b1",
        cornerSize: 12,
        transparentCorners: false,
        borderColor: "#5655b1",
        centeredScaling: true,
      });

      // Save design
      currentDesign = img;

      // Add to canvas
      canvas.add(currentDesign);
      canvas.setActiveObject(currentDesign);

      // Show controls section
      document.getElementById("designControls").style.display = "block";

      // Update design position tracking when moved
      currentDesign.on("moved", function () {
        designPosition = { x: currentDesign.left, y: currentDesign.top };
      });

      currentDesign.on("scaled", function () {
        designScale = currentDesign.scaleX;
        document.getElementById("designScale").value = designScale;
        document.getElementById("scaleValue").textContent =
          Math.round(designScale * 100) + "%";
      });

      currentDesign.on("rotated", function () {
        designRotation = currentDesign.angle;
        document.getElementById("designRotation").value = designRotation;
        document.getElementById("rotationValue").textContent =
          Math.round(designRotation) + "°";
      });

      // Update initial values
      designPosition = { x: currentDesign.left, y: currentDesign.top };
      designScale = 1;
      designRotation = 0;

      // Update controls display
      document.getElementById("designScale").value = designScale;
      document.getElementById("scaleValue").textContent = "100%";
      document.getElementById("designRotation").value = designRotation;
      document.getElementById("rotationValue").textContent = "0°";

      canvas.renderAll();
    });

    // Show design name
    document.getElementById("designName").textContent = file.name;
    document.getElementById("designPreview").style.display = "block";
  };

  reader.readAsDataURL(file);
}

// Update design scale
function updateDesignScale(scale) {
  if (!currentDesign) return;

  currentDesign.scale(scale);
  designScale = scale;

  document.getElementById("scaleValue").textContent =
    Math.round(scale * 100) + "%";
  canvas.renderAll();
}

// Update design rotation
function updateDesignRotation(angle) {
  if (!currentDesign) return;

  currentDesign.set("angle", angle);
  designRotation = angle;

  document.getElementById("rotationValue").textContent = angle + "°";
  canvas.renderAll();
}

// Center design in design area
function centerDesign() {
  if (!currentDesign) return;

  currentDesign.set({
    left: designArea.left,
    top: designArea.top,
  });

  designPosition = { x: designArea.left, y: designArea.top };
  canvas.renderAll();
}

// Reset design to default settings
function resetDesign() {
  if (!currentDesign) return;

  currentDesign.set({
    left: designArea.left,
    top: designArea.top,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
  });

  designPosition = { x: designArea.left, y: designArea.top };
  designScale = 1;
  designRotation = 0;

  document.getElementById("designScale").value = 1;
  document.getElementById("scaleValue").textContent = "100%";
  document.getElementById("designRotation").value = 0;
  document.getElementById("rotationValue").textContent = "0°";

  canvas.renderAll();
}

// Remove design
function removeDesign() {
  if (!currentDesign) return;

  canvas.remove(currentDesign);
  currentDesign = null;

  document.getElementById("designControls").style.display = "none";
  document.getElementById("designPreview").style.display = "none";

  canvas.renderAll();
}

// Position design on shirt when changing sides
function positionDesignOnShirt() {
  if (!currentDesign) return;

  // Get design area for current side
  const bounds = DESIGN_AREA_BOUNDS[currentSide];
  const areaLeft =
    canvas.width * bounds.left + (canvas.width * bounds.width) / 2;
  const areaTop =
    canvas.height * bounds.top + (canvas.height * bounds.height) / 2;

  currentDesign.set({
    left: areaLeft,
    top: areaTop,
    scaleX: designScale,
    scaleY: designScale,
    angle: designRotation,
  });

  designPosition = { x: areaLeft, y: areaTop };

  canvas.renderAll();
}

// Get canvas image as data URL
function getCanvasImage() {
  return canvas.toDataURL({
    format: "png",
    quality: 1,
    multiplier: 2,
  });
}

// Update order summary based on selections
function updateOrderSummary() {
  // Get selected options
  const product = document.querySelector('input[name="product"]:checked').value;
  const color = document.getElementById("color").value;
  const size = document.getElementById("size").value;

  // Update summary
  document.getElementById("summaryProduct").textContent =
    product === "tshirt" ? "Футболка" : "Спортивная футболка";

  document.getElementById("summaryColor").textContent = getColorName(color);

  document.getElementById("summarySize").textContent = size
    ? size.toUpperCase()
    : "Не выбран";

  // Calculate price
  let basePrice = product === "tshirt" ? 12990 : 15990;

  // Add design cost if design is added
  const designCost = currentDesign ? 5000 : 0;

  // Add shipping
  const shippingCost = 3000;

  // Total
  const totalPrice = basePrice + designCost + shippingCost;

  // Update price in summary
  document.getElementById("basePrice").textContent = formatCurrency(basePrice);
  document.getElementById("designPrice").textContent =
    formatCurrency(designCost);
  document.getElementById("shippingPrice").textContent =
    formatCurrency(shippingCost);
  document.getElementById("totalPrice").textContent =
    formatCurrency(totalPrice);
}

// Get color name from value
function getColorName(color) {
  const colorNames = {
    white: "Белый",
    black: "Черный",
    navy: "Темно-синий",
    gray: "Серый",
    red: "Красный",
  };

  return colorNames[color] || color;
}

// Format currency in Uzbek sum
function formatCurrency(amount) {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  // Basic validation
  const requiredFields = ["color", "size"];
  for (const field of requiredFields) {
    const element = document.getElementById(field);
    if (!element.value) {
      alert(`Пожалуйста, выберите ${field === "color" ? "цвет" : "размер"}`);
      element.focus();
      return;
    }
  }

  // Check if design was added
  if (!currentDesign) {
    if (!confirm("Вы не добавили дизайн. Хотите продолжить без дизайна?")) {
      return;
    }
  }

  // Get design preview image
  const designImage = getCanvasImage();

  // Create form data
  const formData = new FormData(e.target);

  // Add design image
  if (designImage) {
    // Convert data URL to blob
    const blob = dataURLtoBlob(designImage);
    formData.append("designImage", blob, "design.png");
  }

  // Add design details
  if (currentDesign) {
    const designDetails = {
      position: designPosition,
      scale: designScale,
      rotation: designRotation,
      side: currentSide,
    };

    formData.append("designDetails", JSON.stringify(designDetails));
  }

  // Show loading state
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("submitBtn").textContent = "Отправка...";

  // Simulate sending to server
  setTimeout(() => {
    // Send data to server
    submitToServer(formData);
  }, 1500);
}

// Convert data URL to blob
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Submit form data to server
function submitToServer(formData) {
  // This would be an actual API call in production
  // For demo, we'll simulate a successful submission

  try {
    // Simulated server response
    const orderNumber = Date.now().toString().slice(-6);
    const response = {
      success: true,
      orderNumber: orderNumber,
      message: "Заказ успешно создан",
    };

    if (response.success) {
      showSuccessMessage(response.orderNumber);
    } else {
      showErrorMessage(response.message);
    }
  } catch (error) {
    showErrorMessage("Произошла ошибка при отправке заказа");
    console.error(error);
  } finally {
    // Reset button
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("submitBtn").textContent = "Оформить заказ";
  }
}

// Show success message
function showSuccessMessage(orderNumber) {
  alert(
    `Заказ успешно создан!\n\nНомер заказа: ${orderNumber}\n\nМы свяжемся с вами в ближайшее время для подтверждения заказа.`
  );

  // Optionally reset form
  if (confirm("Хотите оформить еще один заказ?")) {
    resetForm();
  } else {
    window.location.href = "index.html";
  }
}

// Show error message
function showErrorMessage(message) {
  alert(
    `Ошибка: ${message}\n\nПожалуйста, попробуйте еще раз или свяжитесь с нами для помощи.`
  );
}

// Reset form
function resetForm() {
  document.getElementById("customizeForm").reset();

  if (currentDesign) {
    removeDesign();
  }

  // Reset to default values
  currentTshirt = "white";
  currentSide = "front";

  // Reload default t-shirt
  loadTshirtTemplate(currentTshirt, currentSide);

  // Reset side indicator
  document.getElementById("sideIndicator").textContent = "Вид спереди";

  // Update summary
  updateOrderSummary();
}

// Export functions for HTML access
window.TshirtConfigurator = {
  handleFormSubmit,
  centerDesign,
  resetDesign,
  removeDesign,
  updateDesignScale,
  updateDesignRotation,
};

// Site-wide subtle reveal animations
function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition =
            "transform 500ms ease, opacity 500ms ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  const revealables = document.querySelectorAll(
    ".floating-element, .feature-card, .product-card, .configurator-card"
  );
  revealables.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    observer.observe(el);
  });
}
