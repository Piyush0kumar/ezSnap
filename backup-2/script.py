import sys
import instaloader
import os
import secrets
import string
import time
import json

class SuppressOutput:
    """Suppress all output (stdout and stderr) within this context."""
    def __enter__(self):
        self._stdout = sys.stdout
        self._stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._stdout
        sys.stderr = self._stderr


def generate_random_filename(extension: str) -> str:
    """Generate a random 32-character filename with the specified extension."""
    random_str = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    return f"{random_str}.{extension}"


# Get the link from the command line argument
link = sys.argv[1]

# Initialize variables
mp4_file_path = None
jpg_file_path = None
operation_status = None  # Stores TRUE for success or error message for failure

try:
    L = instaloader.Instaloader()
    reel_url = link

    with SuppressOutput():
        post = instaloader.Post.from_shortcode(L.context, reel_url.split('/')[-2])
        L.download_post(post, target="dump")
        # time.sleep(2)

    # Search and rename .mp4 and .jpg files in the target directory
    target_directory = "dump"
    for root, dirs, files in os.walk(target_directory):
        for file in files:
            file_path = os.path.join(root, file)
            if file.endswith(".temp"):
                continue
            if file.endswith(".mp4"):
                new_mp4_name = generate_random_filename("mp4")
                new_mp4_path = os.path.join(root, new_mp4_name)
                os.rename(file_path, new_mp4_path)
                mp4_file_path = new_mp4_path
            elif file.endswith(".jpg"):
                new_jpg_name = generate_random_filename("jpg")
                new_jpg_path = os.path.join(root, new_jpg_name)
                os.rename(file_path, new_jpg_path)
                jpg_file_path = new_jpg_path

    operation_status = True  # Successful execution

except Exception as e:
    operation_status = str(e)  # Store the error message in case of failure

# Return JSON response to the Node.js server
result = {
    "mp4_file_path": mp4_file_path,
    "jpg_file_path": jpg_file_path,
    "operation_status": operation_status
}
print(json.dumps(result))
















