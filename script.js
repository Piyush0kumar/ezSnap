//Remove suggestion of link //
document.getElementById("query").setAttribute("autocomplete", "off");

function showErrorPopup(message) {
  const popup = document.getElementById("errorpop-up");
  const overlay = document.getElementById("popup-overlay");
  const messageElement = document.getElementById("popup-message");

  messageElement.innerText = message;
  popup.style.display = "flex"; // Show popup
  overlay.style.display = "block"; // Show overlay

  setTimeout(() => {
    popup.classList.add("show");
    overlay.classList.add("show");
  }, 10); // Slight delay to trigger transition
}

function hideerrorPopup() {
  const popup = document.getElementById("errorpop-up");
  const overlay = document.getElementById("popup-overlay");

  popup.classList.remove("show");
  overlay.classList.remove("show");

  setTimeout(() => {
    popup.style.display = "none";
    overlay.style.display = "none";
  }, 500); // Wait for transition to complete before hiding
}


function isValidInstagramLink(link) {
  // Trim leading and trailing spaces from the input
  link = link.trim();

  // Define a regular expression to match various valid Instagram URL formats
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv|stories|explore)?\/?[A-Za-z0-9._%-]+(\/.*)?$/;

  // Test the link against the regex and return true if it matches
  return instagramRegex.test(link);
}


function ShowLoading() {
  const button = document.getElementById("fetch-button");
  const loader = document.getElementById("loadingFetch");

  button.style.display = "none";
  loader.style.display = "flex";
}

function CloseLoading() {
  const button = document.getElementById("fetch-button");
  const loader = document.getElementById("loadingFetch");

  button.style.display = "flex";
  loader.style.display = "none";
}





let mp4Location;
let imageLocation;

async function FetchContent() {
  const url = document.getElementById('query').value;
  document.getElementById('query').value = '';


  if (!url) {
    showErrorPopup("please enter a url..");
    return;
  }
  if (!isValidInstagramLink(url)) {
    showErrorPopup("please enter a valid url..");
    return;
  }

  try {
    ShowLoading();
    const response = await fetch("http://localhost:3000/process-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      console.error("Failed to execute Python script");
      return;
    }

    console.log(response);
    const result = await response.json();

    if (result.operation_status === true) {
      console.log("Python Script Result:", result);
      CloseLoading();

      // Debugging before updating
      console.log("Previous Paths:", mp4Location, imageLocation);

      // Ensure fresh fetch by adding timestamp to prevent caching issues
      mp4Location = result.mp4_file_path + "?t=" + new Date().getTime();
      imageLocation = result.jpg_file_path + "?t=" + new Date().getTime();


      console.log("Updated Paths:", mp4Location, imageLocation);
      if (mp4Location.includes("null")) {
        document.getElementById("buttonDownloadReel").style.display = "none";
      } else {
        document.getElementById("buttonDownloadReel").style.display = "";
      }

      showPopup(imageLocation);
    }
    else {
      CloseLoading();
      document.getElementById("result").innerHTML = `<p style="color: red;">Error: ${result.operation_status}</p>`;
    }

    // Clear the input field after successful request
    document.getElementById('query').value = "";

  } catch (error) {
    CloseLoading();
    document.getElementById("result").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}






function showPopup(photoLocation) {
  console.log("showPopup function triggered");
  const popup = document.getElementById("new-popup");
  const fetchButton = document.getElementById("fetch-button");



  document.getElementById("photo-preview").src = photoLocation;

  // Hide the Fetch Content Button with a fade-out effect
  fetchButton.classList.add("fade-out");
  setTimeout(() => {
    fetchButton.style.display = "none";
    popup.classList.remove("hidden-popup");
    popup.style.display = "flex";
  }, 300);
}


function goBackToFetchContent() {
  const popup = document.getElementById("new-popup");
  popup.style.display = "none";


  const fetchButton = document.getElementById("fetch-button");
  fetchButton.classList.remove("fade-out");
  fetchButton.classList.add("fade-in");

  setTimeout(() => {
    fetchButton.style.display = "flex";
  }, 300);
}




function downloadVideo() {
  if (!mp4Location) {
    showErrorPopup("No video available for download.");
    return;
  }

  // Extract only the filename from the full path
  const filename = mp4Location.split("\\").pop(); // Windows uses "\\", Linux/Mac uses "/"
  const downloadURL = `http://localhost:3000/download/${filename}`;

  const a = document.createElement("a");
  a.href = downloadURL;
  a.download = filename; // Keep the original filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function downloadImage() {
  if (!imageLocation) {
    showErrorPopup("No video available for download.");
    return;
  }

  // Extract only the filename from the full path
  const filename = imageLocation.split("\\").pop(); // Windows uses "\\", Linux/Mac uses "/"
  const downloadURL = `http://localhost:3000/download/${filename}`;

  const a = document.createElement("a");
  a.href = downloadURL;
  a.download = filename; // Keep the original filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
