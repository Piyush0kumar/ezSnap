

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

  button.style.display="none";
  loader.style.display="flex";
}

function CloseLoading() {
  const button = document.getElementById("fetch-button");
  const loader = document.getElementById("loadingFetch");

  button.style.display="flex";
  loader.style.display="none";
}







async function FetchContent() {
  const url = document.getElementById('query').value;
  if(!isValidInstagramLink(url)){
    alert("provide a valid link");
    return;
  }
  if (!url) {
    alert("Please enter a valid URL.");
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

    const result = await response.json();

    if (result.operation_status === true) {
      console.log("Python Script Result:", result);
      CloseLoading();
      
      showPopup(result.mp4_file_path,  result.jpg_file_path);
    } else {
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






function showPopup(mp4Location, photoLocation) {
  console.log("showPopup function triggered");
  const popup = document.getElementById("new-popup");
  const fetchButton = document.getElementById("fetch-button");
  
  document.getElementById("photo-preview").src = photoLocation;
  document.getElementById("video-download").href = mp4Location;
  document.getElementById("photo-download").href = photoLocation;

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



function updateContent(videoUrl, photoUrl) {
  // Update video
  document.getElementById("video-source").src = videoUrl;
  document.getElementById("fetched-video").load();
  document.getElementById("video-download").href = videoUrl;

  // Update photo
  document.getElementById("fetched-photo").src = photoUrl;
  document.getElementById("photo-download").href = photoUrl;
}

// // Example usage
// updateContent("https://example.com/video.mp4", "https://example.com/photo.jpg");
