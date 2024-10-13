import os
import time
import json
import requests

class TelegramSender:
    def __init__(self, bot_token, chat_id, topic_id=None):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.topic_id = topic_id

    def send_message(self, message):
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.chat_id,
            'text': message
        }
        if self.topic_id is not None:
            data['message_thread_id'] = self.topic_id
        try:
            response = requests.post(url, data=data)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error sending message: {e}")
        else:
            print(f"Message sent: {message}")

class DirectoryWatcher:
    def __init__(self, directory_path):
        self.directory_path = directory_path
        self.known_files = set(os.listdir(directory_path))

    def check_for_new_json_files(self):
        current_files = set(os.listdir(self.directory_path))
        new_files = current_files - self.known_files
        self.known_files = current_files
        new_json_files = [f for f in new_files if f.endswith('.json')]
        json_contents = {}
        for filename in new_json_files:
            filepath = os.path.join(self.directory_path, filename)
            try:
                with open(filepath, 'r') as f:
                    content = json.load(f)
                json_contents[filename] = content
            except Exception as e:
                print(f"Error reading {filename} file: {e}")
        return json_contents

def main():
    
    bot_token = os.environ.get('SOLPULSEBOTTELEGRAMTOKEN')
    chat_id = os.environ.get('SOLPULSEBOTTELEGRAMCHATID')
    topic_id = os.environ.get('SOLPULSEBOTTELEGRAMTOPICID')
    directory_path = os.environ.get('SOLPULSEBOTLOGDIRECTORY')
    
    if not all([bot_token, chat_id, directory_path]):
        raise ValueError("The required environment variables are not set.")
    
    # If topic_id is not set, leave it as None
    topic_id = topic_id if topic_id else None

    

    telegram_sender = TelegramSender(bot_token, chat_id, topic_id)
    directory_watcher = DirectoryWatcher(directory_path)

    while True:
        new_json_files = directory_watcher.check_for_new_json_files()
        for filename, content in new_json_files.items():
            # Send the filename
            telegram_sender.send_message(f"New JSON file: {filename}")
            # Send the file content
            content_str = json.dumps(content, indent=2, ensure_ascii=False)
            telegram_sender.send_message(f"The content of {filename}:\n{content_str}")
        time.sleep(1)

if __name__ == '__main__':
    main()

