from flask import Flask, render_template, request, jsonify
import openai
import pyttsx3
import threading
import time

# Configuration for Flask
app = Flask(__name__)

# Set your OpenAI API key here
openai.api_key = "API_KEY"

memory = []

def ask_assistant(question):
    prompt = f"Você: {question}\nAssistente Jarvis: "
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=400
    )
    return response['choices'][0]['text'].strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assistente', methods=['POST'])
def assistant_interaction():
    try:
        data = request.get_json()
        user_input = data['pergunta']

        if user_input.lower() in ['repeat', 'repita', 'repetir']:
            if memory:
                response = memory[-1]  
            else:
                response = "Desculpe, não há nada para repetir."
        else:
            response = ask_assistant(user_input)
            memory.append(response)

        threading.Thread(target=text_to_speech_and_display, args=(user_input, response)).start()

        return jsonify({'resposta': response})
    except Exception as e:
        print(f"Erro na interação com o assistente: {e}")
        return jsonify({'resposta': 'Desculpe, ocorreu um erro na interação.'})

def text_to_speech_and_display(user_input, bot_response):
    # Speech synthesis
    engine = pyttsx3.init()
    engine.say(bot_response)
    engine.runAndWait()

    time.sleep(20)

    chat_box = f"<div><strong>Você:</strong> {user_input}</div><div><strong>Assistente Jarvis:</strong> </div>"
    for char in bot_response:
        time.sleep(0.05)  # Adjust typing speed here (smaller value for faster typing)
        chat_box += char
        response = jsonify({'resposta': chat_box})
        response.status_code = 200
        response.content_type = 'application/json'
        yield response

if __name__ == "__main__":
        app.run(debug=True)
