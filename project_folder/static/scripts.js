document.addEventListener("DOMContentLoaded", function() {
    var chatBox = document.getElementById("chatBox");
    var userInput = document.getElementById("userInput");
  
    function appendMessage(sender, message) {
        var messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function askAssistant(question) {
        appendMessage("Você", question);
        fetch('/assistente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'pergunta': question })
        })
        .then(response => response.json())
        .then(data => {
            appendMessage("Resposta", data.resposta); // Remova os dois pontos após "Resposta"
            textToSpeech(data.resposta);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    }
  
    function textToSpeech(text) {
        var speech = new SpeechSynthesisUtterance();
        speech.lang = 'pt-BR';
        speech.text = text;
        speechSynthesis.speak(speech);
    }
  
    function continuousSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) { // Adicione a verificação de suporte para SpeechRecognition
            var recognition = new webkitSpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.continuous = true;
            recognition.interimResults = true;
  
            recognition.onresult = function(event) {
                var question = event.results[event.results.length - 1][0].transcript;
                userInput.value = question;
                if (event.results[event.results.length - 1].isFinal) {
                    askAssistant(question);
                }
            }
  
            recognition.onerror = function(event) {
                console.error('Erro no reconhecimento de voz:', event.error);
                recognition.stop();
            }
  
            recognition.onend = function() {
                continuousSpeechRecognition();
            }
  
            recognition.start();
        } else {
            console.error('Speech recognition not supported.');
        }
    }
  
    continuousSpeechRecognition();
  
    userInput.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            var question = userInput.value.trim();
            if (question !== "") {
                userInput.value = "";
                askAssistant(question);
            }
        }
    });
  });