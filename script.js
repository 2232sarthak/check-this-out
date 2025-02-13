const no_prompts = [
  { text: "Sharam to na aayi? 🧐", image: "media/no_1.gif" },
  { text: "Ye baat ho gyi ab 😕", image: "media/no_2.gif" },
  { text: "Chl bas ho gyi masti yes daba de 🤨", image: "media/no_3.gif" },
  { text: "Ja me ni krta baat 💔", image: "media/no_4.gif" },
  { text: "Itna chubhne laga hu😭", image: "media/no_5.jpg" },
];

let noIndex = 0;

function checkDate() {
  const inputDate = document.getElementById("date-input").value;
  const correctDate = "2022-07-21";
  const confirmBtn = document.getElementById("confirm-btn");
  const inputSection = document.getElementById("input-section");
  if (inputDate === correctDate) {
    document.getElementById("main-image").src = "media/victory.gif";
    document.getElementById("question-text").textContent =
      "Verification Successful😸";
    confirmBtn.textContent = "Continue😁";

    localStorage.setItem("step1Verified", "true");

    confirmBtn.onclick = function () {
      window.location.href = "step2.html";
    };
  } else {
    document.getElementById("main-image").src = "media/cat_with_gun.gif";
    document.getElementById("question-text").textContent =
      "Stay away traitor!😡";
    confirmBtn.textContent = "Retry🔄️";
    confirmBtn.onclick = function () {
      location.reload();
    };
  }
  document.getElementById("date-input").style.display = "none";
}

function handleYes() {
  document.getElementById("main-image").src = "media/love_success.gif"; // Change Image
  document.getElementById("question-text").textContent =
    "Mujhe pata tha tu Yes hi dabaegi! Me hu hi itna perfect 😌"; // Change Question

  // Remove Yes and No Buttons
  document.querySelector(".button-section").innerHTML = `
      <button class="continue-button" onclick="goToNextPhase()">Continue</button>
    `;
}

function handleNo() {
  const noButton = document.querySelector(".no-button");
  const yesButton = document.querySelector(".yes-button");

  // Increase Yes Button Size
  let currentSize = parseFloat(window.getComputedStyle(yesButton).fontSize);
  yesButton.style.fontSize = `${currentSize * 1.5}px`;

  // Update Image and Question Text
  if (noIndex < no_prompts.length) {
    document.getElementById("main-image").src = no_prompts[noIndex].image;
    document.getElementById("question-text").textContent =
      no_prompts[noIndex].text;
    noIndex++;
  } else {
    document.getElementById("question-text").textContent =
      "Ab No ka koi option nhi hai! Yes dabana padega! 😤";
    noButton.style.display = "none"; // Hide No Button After Last Prompt
  }
}

function goToNextPhase() {
  window.location.href = "step3.html"; // Redirect to next phase
}

// ✅ Redirect to Step 1 if user has not verified Step 1
window.onload = function () {
  if (!localStorage.getItem("step1Verified")) {
    if (window.location.pathname.includes("step3.html")) {
      window.location.replace("index.html"); // 🔥 Prevent direct access to Step 3
    }
  }

  // ✅ Run Camera Code Only If on Step 3
  if (window.location.pathname.includes("step3.html")) {
    startCamera();
  }
};

// ✅ Function to Open Camera
function startCamera() {
  const video = document.getElementById("camera");

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        alert("Camera access denied! Please enable camera.");
      });
  } else {
    alert("Your browser does not support camera access.");
  }
}

// ✅ Capture Selfie
document.getElementById("capture-btn").addEventListener("click", function () {
  const video = document.getElementById("camera");
  const canvas = document.getElementById("canvas");
  const selfiePreview = document.getElementById("selfie-preview");
  const confirmBtn = document.getElementById("confirm-btn");

  // Capture Image from Camera
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert Image to Data URL
  let imageDataURL = canvas.toDataURL("image/png");

  // Show Selfie Preview
  selfiePreview.src = imageDataURL;
  selfiePreview.style.display = "block";

  // Hide Camera and Capture Button
  video.style.display = "none";
  this.style.display = "none";

  // Show Confirm Button
  confirmBtn.style.display = "block";

  // Save Image for WhatsApp Sharing
  localStorage.setItem("selfieImage", imageDataURL);
});

async function loadConfig() {
  try {
    let response = await fetch("config.json");
    let config = await response.json();
    window.env = config;
    console.log("Config Loaded:", window.env);
  } catch (error) {
    console.error("Error loading config:", error);
  }
}

// ✅ Load Config Before Everything Else
loadConfig();

// ✅ Send Image to WhatsApp
async function sendToWhatsApp() {
  if (!window.env) {
    await loadConfig();
  }

  let imageDataURL = localStorage.getItem("selfieImage");
  if (!imageDataURL) {
    alert("No image found! Please take a selfie first.");
    return;
  }

  // ✅ Upload Image to ImgBB
  fetch(imageDataURL)
    .then((res) => res.blob())
    .then((blob) => {
      let formData = new FormData();
      formData.append("image", blob);
      formData.append("expiration", 600); // Auto-delete after 10 min

      fetch(`https://api.imgbb.com/1/upload?key=${window.env.IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            let imageUrl = data.data.url;
            let message = `😌 Chl tu bhi kya yaad rakhega ban gyi teri valentine! 💕\n\n📸 Image: ${imageUrl}`;
            let whatsappURL = `https://wa.me/${
              window.env.WHATSAPP_PHONE
            }?text=${encodeURIComponent(message)}`;

            // ✅ Open WhatsApp with Image Link
            window.open(whatsappURL, "_blank");

            // ✅ Show Thank You Message After Sending
            showThankYouMessage();
          } else {
            alert("Image upload failed! Try again.");
          }
        })
        .catch((err) => console.error("Upload Error:", err));
    })
    .catch((err) => console.error("Error processing image:", err));
}

// ✅ Function to Show Thank You Message and Restart Button
function showThankYouMessage() {
  document.body.innerHTML = `
        <div class="thank-you-container">
            <h2>Thank You! 💖</h2>
            <p>Your special selfie has been sent successfully! 🎉</p>
            <button onclick="restartJourney()">Start Again 🔄</button>
        </div>
    `;
}

// ✅ Restart Journey (Redirect to Step 1)
function restartJourney() {
  localStorage.removeItem("step1Verified"); // Clear Verification
  window.location.href = "index.html"; // Redirect to Start
}
