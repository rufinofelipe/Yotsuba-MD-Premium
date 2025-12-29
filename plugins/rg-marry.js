<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casamiento Virtual</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 40px;
            max-width: 800px;
            width: 100%;
            text-align: center;
            animation: fadeIn 1s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            margin-bottom: 30px;
        }
        
        h1 {
            color: #e91e63;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        
        .ring-icon {
            font-size: 3em;
            color: gold;
            margin: 20px 0;
            animation: spin 4s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .wedding-photo {
            max-width: 100%;
            border-radius: 15px;
            border: 8px solid #f8e0e6;
            margin: 20px 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .couple-info {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .person {
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
            margin: 10px;
            min-width: 200px;
            border: 2px dashed #e91e63;
        }
        
        .person h3 {
            color: #e91e63;
            margin-bottom: 10px;
        }
        
        .status-container {
            margin: 30px 0;
            padding: 20px;
            background: #fff8e1;
            border-radius: 10px;
            border-left: 5px solid #ffc107;
        }
        
        .status {
            font-size: 1.5em;
            color: #333;
            font-weight: bold;
            margin: 10px 0;
            min-height: 40px;
        }
        
        .married {
            color: #4CAF50;
        }
        
        .divorced {
            color: #f44336;
        }
        
        .buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        button {
            padding: 15px 30px;
            font-size: 1.1em;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            min-width: 180px;
        }
        
        .marry-btn {
            background: linear-gradient(45deg, #e91e63, #ff4081);
            color: white;
            box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
        }
        
        .marry-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
        }
        
        .divorce-btn {
            background: linear-gradient(45deg, #757575, #9e9e9e);
            color: white;
            box-shadow: 0 4px 15px rgba(117, 117, 117, 0.3);
        }
        
        .divorce-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(117, 117, 117, 0.4);
        }
        
        .reset-btn {
            background: linear-gradient(45deg, #2196F3, #21CBF3);
            color: white;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        }
        
        .reset-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
        }
        
        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: #f00;
            opacity: 0;
        }
        
        .certificate {
            margin-top: 30px;
            padding: 20px;
            background: #fffde7;
            border: 2px solid gold;
            border-radius: 10px;
            display: none;
        }
        
        .certificate.show {
            display: block;
            animation: slideIn 0.5s ease;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 2em;
            }
            
            .buttons {
                flex-direction: column;
                align-items: center;
            }
            
            button {
                width: 100%;
                max-width: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💍 Casamiento Virtual 💍</h1>
            <p class="subtitle">Una simulación divertida de matrimonio y divorcio</p>
            <div class="ring-icon">💍</div>
        </div>
        
        <div class="couple-info">
            <div class="person">
                <h3>👰 Persona 1</h3>
                <p>Nombre: <input type="text" id="name1" value="Ana" placeholder="Ingresa nombre"></p>
                <p>Edad: <input type="number" id="age1" value="28" min="18" max="120" style="width: 60px;"></p>
            </div>
            
            <div class="person">
                <h3>🤵 Persona 2</h3>
                <p>Nombre: <input type="text" id="name2" value="Carlos" placeholder="Ingresa nombre"></p>
                <p>Edad: <input type="number" id="age2" value="30" min="18" max="120" style="width: 60px;"></p>
            </div>
        </div>
        
        <div>
            <h3>Foto del Casamiento</h3>
            <img src="https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg" 
                 alt="Foto de casamiento" 
                 class="wedding-photo"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400/FFC0CB/000000?text=Foto+de+Casamiento';">
            <p><em>Imagen del casamiento proporcionada</em></p>
        </div>
        
        <div class="status-container">
            <h3>Estado Civil</h3>
            <div id="status" class="status">Actualmente: Solteros 💔</div>
            <div id="message"></div>
        </div>
        
        <div class="buttons">
            <button class="marry-btn" onclick="getMarried()">💑 Casarse</button>
            <button class="divorce-btn" onclick="getDivorced()">💔 Divorciarse</button>
            <button class="reset-btn" onclick="resetAll()">🔄 Reiniciar</button>
        </div>
        
        <div id="certificate" class="certificate">
            <h3>📜 Certificado de Matrimonio</h3>
            <p id="certificate-text"></p>
            <p><strong>Fecha:</strong> <span id="wedding-date"></span></p>
            <p><em>Este es un certificado simbólico sin valor legal.</em></p>
        </div>
    </div>

    <script>
        let isMarried = false;
        let marriageDate = null;
        let divorceDate = null;
        
        function getMarried() {
            if (isMarried) {
                document.getElementById('message').innerHTML = '<p style="color: #e91e63;">¡Ya están casados! 💑</p>';
                return;
            }
            
            const name1 = document.getElementById('name1').value || "Persona 1";
            const name2 = document.getElementById('name2').value || "Persona 2";
            const age1 = parseInt(document.getElementById('age1').value) || 18;
            const age2 = parseInt(document.getElementById('age2').value) || 18;
            
            // Verificar edad mínima
            if (age1 < 18 || age2 < 18) {
                document.getElementById('message').innerHTML = '<p style="color: #f44336;">❌ Ambos deben ser mayores de 18 años para casarse</p>';
                return;
            }
            
            isMarried = true;
            marriageDate = new Date();
            
            document.getElementById('status').innerHTML = `Actualmente: Casados 💖`;
            document.getElementById('status').className = 'status married';
            
            document.getElementById('message').innerHTML = `
                <p style="color: #4CAF50; font-size: 1.2em;">
                    🎉 ¡FELICIDADES! ${name1} y ${name2} se han casado. 🎉
                </p>
                <p>Que su unión esté llena de amor y felicidad.</p>
            `;
            
            // Mostrar certificado
            const certificate = document.getElementById('certificate');
            certificate.classList.add('show');
            
            document.getElementById('certificate-text').innerText = 
                `Certificamos que ${name1} y ${name2} han contraído matrimonio en esta simulación virtual.`;
            
            document.getElementById('wedding-date').innerText = 
                marriageDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            // Efecto de confeti
            createConfetti();
            
            // Sonido de campanas (simulado con vibración si está disponible)
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
        
        function getDivorced() {
            if (!isMarried) {
                document.getElementById('message').innerHTML = '<p style="color: #ff9800;">❌ Primero deben casarse para divorciarse</p>';
                return;
            }
            
            const name1 = document.getElementById('name1').value || "Persona 1";
            const name2 = document.getElementById('name2').value || "Persona 2";
            
            isMarried = false;
            divorceDate = new Date();
            
            document.getElementById('status').innerHTML = `Actualmente: Divorciados 💔`;
            document.getElementById('status').className = 'status divorced';
            
            const marriageDuration = Math.floor((divorceDate - marriageDate) / 1000);
            
            document.getElementById('message').innerHTML = `
                <p style="color: #f44336; font-size: 1.2em;">
                    💔 ${name1} y ${name2} se han divorciado.
                </p>
                <p>El matrimonio duró ${marriageDuration} segundos virtuales.</p>
                <p><em>"Hasta que la muerte los separe... o el botón de divorcio"</em></p>
            `;
            
            // Ocultar certificado
            document.getElementById('certificate').classList.remove('show');
            
            // Efecto visual de rotura
            const ring = document.querySelector('.ring-icon');
            ring.style.animation = 'none';
            setTimeout(() => {
                ring.style.animation = 'spin 4s linear infinite';
            }, 100);
        }
        
        function resetAll() {
            isMarried = false;
            marriageDate = null;
            divorceDate = null;
            
            document.getElementById('status').innerHTML = `Actualmente: Solteros 💔`;
            document.getElementById('status').className = 'status';
            
            document.getElementById('message').innerHTML = '';
            document.getElementById('certificate').classList.remove('show');
            
            // Restablecer nombres por defecto
            document.getElementById('name1').value = "Ana";
            document.getElementById('name2').value = "Carlos";
            document.getElementById('age1').value = "28";
            document.getElementById('age2').value = "30";
            
            document.getElementById('message').innerHTML = '<p style="color: #2196F3;">✨ Todo ha sido reiniciado. ¡Prepárense para una nueva historia! ✨</p>';
        }
        
        function createConfetti() {
            const colors = ['#e91e63', '#ff4081', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
            
            for (let i = 0; i < 150; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                document.body.appendChild(confetti);
                
                // Animación
                const animation = confetti.animate([
                    { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 3000 + 2000,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
                });
                
                // Eliminar después de la animación
                animation.onfinish = () => confetti.remove();
            }
        }
        
        // Cargar imagen con manejo de errores
        window.addEventListener('load', function() {
            const img = document.querySelector('.wedding-photo');
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/600x400/FFC0CB/000000?text=Foto+de+Casamiento';
                this.alt = 'Imagen alternativa de casamiento';
            };
        });
    </script>
</body>
</html>