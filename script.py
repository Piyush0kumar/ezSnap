import sys
import instaloader
import os
import secrets
import json

class SuppressOutput:
    """Suppress only stdout (not stderr) within this context."""
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._stdout

def generate_random_filename(extension: str) -> str:
    """Generate a random 16-character filename prefixed with 'StreamSaver-'."""
    random_hex = secrets.token_hex(8)  # Generates a 16-character hex string
    return f"StreamSaver-{random_hex}.{extension}"

def get_existing_files(directory):
    """Get a set of filenames that exist in the directory before downloading."""
    return set(os.listdir(directory))

def find_new_files(before, after):
    """Identify files that were added after downloading."""
    return list(after - before)  # Convert set difference to list

# Get the link from the command line argument
link = sys.argv[1]
target_directory = "dump"

try:
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)

    # Track existing files before downloading
    existing_files = get_existing_files(target_directory)

    L = instaloader.Instaloader()
    reel_url = link

    with SuppressOutput():
        post = instaloader.Post.from_shortcode(L.context, reel_url.split('/')[-2])
        L.download_post(post, target=target_directory)

    # Track new files after downloading
    new_files = find_new_files(existing_files, get_existing_files(target_directory))

    mp4_file_path = None
    jpg_file_path = None

    for file in new_files:
        old_path = os.path.join(target_directory, file)
        if file.endswith(".mp4"):
            new_name = generate_random_filename("mp4")
            new_path = os.path.join(target_directory, new_name)
            os.rename(old_path, new_path)
            mp4_file_path = new_path

        elif file.endswith(".jpg"):
            new_name = generate_random_filename("jpg")
            new_path = os.path.join(target_directory, new_name)
            os.rename(old_path, new_path)
            jpg_file_path = new_path

    result = {
        "mp4_file_path": mp4_file_path,
        "jpg_file_path": jpg_file_path,
        "operation_status": True
    }
    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
