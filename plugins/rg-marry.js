// Código para simulación de casamiento y divorcio - Versión para bot
function weddingBot() {
    // Estado inicial
    let estado = {
        casados: false,
        pareja1: "Ana",
        pareja2: "Carlos",
        fechaCasamiento: null,
        fechaDivorcio: null
    };

    // URL de la imagen del casamiento
    const fotoCasamiento = "https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg";
    
    // Emojis para hacerlo más divertido
    const emojis = {
        casado: "💍💑❤️🎉",
        divorcio: "💔😭📄✂️",
        soltero: "👰🤵💒"
    };

    // Función principal que maneja los comandos
    function manejarComando(comando, nombre1, nombre2) {
        if (comando === "casarse") {
            return casarPareja(nombre1, nombre2);
        } else if (comando === "divorcio") {
            return divorciarPareja();
        } else if (comando === "estado") {
            return mostrarEstado();
        } else if (comando === "ayuda") {
            return mostrarAyuda();
        } else {
            return `Comando no reconocido. Usa "ayuda" para ver opciones.`;
        }
    }

    // Función para casar a la pareja
    function casarPareja(nombre1, nombre2) {
        if (estado.casados) {
            return `${emojis.casado} ¡YA ESTÁN CASADOS! ${emojis.casado}\n` +
                   `${estado.pareja1} y ${estado.pareja2} ya se casaron el ${estado.fechaCasamiento.toLocaleDateString()}\n` +
                   `Foto del casamiento: ${fotoCasamiento}`;
        }

        // Actualizar nombres si se proporcionan
        if (nombre1) estado.pareja1 = nombre1;
        if (nombre2) estado.pareja2 = nombre2;

        estado.casados = true;
        estado.fechaCasamiento = new Date();
        estado.fechaDivorcio = null;

        const mensaje = 
            `${emojis.casado} *¡FELICIDADES! SE HAN CASADO* ${emojis.casado}\n\n` +
            `💒 **Pareja:** ${estado.pareja1} & ${estado.pareja2}\n` +
            `📅 **Fecha:** ${estado.fechaCasamiento.toLocaleDateString()}\n` +
            `⏰ **Hora:** ${estado.fechaCasamiento.toLocaleTimeString()}\n\n` +
            `*"Por esta simulación, yo los declaro marido y mujer"*\n\n` +
            `📸 **Foto del casamiento:**\n${fotoCasamiento}\n\n` +
            `_Usa el comando "divorcio" cuando quieran separarse_`;

        return mensaje;
    }

    // Función para divorciar a la pareja
    function divorciarPareja() {
        if (!estado.casados) {
            return `${emojis.divorcio} PRIMERO DEBEN CASARSE ${emojis.divorcio}\n` +
                   `Usa el comando "casarse" para comenzar la simulación.`;
        }

        estado.casados = false;
        estado.fechaDivorcio = new Date();
        
        // Calcular duración del matrimonio
        const duracionMs = estado.fechaDivorcio - estado.fechaCasamiento;
        const duracionSeg = Math.floor(duracionMs / 1000);
        const duracionMin = Math.floor(duracionSeg / 60);
        const duracionHoras = Math.floor(duracionMin / 60);

        let duracionTexto = "";
        if (duracionHoras > 0) {
            duracionTexto = `${duracionHoras} horas, ${duracionMin % 60} minutos`;
        } else if (duracionMin > 0) {
            duracionTexto = `${duracionMin} minutos, ${duracionSeg % 60} segundos`;
        } else {
            duracionTexto = `${duracionSeg} segundos`;
        }

        const mensaje = 
            `${emojis.divorcio} *¡SE HAN DIVORCIADO!* ${emojis.divorcio}\n\n` +
            `💔 **Pareja divorciada:** ${estado.pareja1} & ${estado.pareja2}\n` +
            `📅 **Fecha de divorcio:** ${estado.fechaDivorcio.toLocaleDateString()}\n` +
            `⏳ **Duración del matrimonio:** ${duracionTexto}\n\n` +
            `📄 **Acta de divorcio firmada virtualmente**\n` +
            `✂️ **Custodia de los emojis dividida:**\n` +
            `   - ${estado.pareja1} se queda con: 💍👰\n` +
            `   - ${estado.pareja2} se queda con: 🤵🎩\n\n` +
            `_Pueden volver a casarse usando "casarse" de nuevo_`;

        return mensaje;
    }

    // Función para mostrar el estado actual
    function mostrarEstado() {
        if (estado.casados) {
            return `📋 **ESTADO ACTUAL:** CASADOS ${emojis.casado}\n` +
                   `👫 Pareja: ${estado.pareja1} & ${estado.pareja2}\n` +
                   `💒 Casados desde: ${estado.fechaCasamiento.toLocaleDateString()}\n` +
                   `⏰ Hora: ${estado.fechaCasamiento.toLocaleTimeString()}`;
        } else {
            return `📋 **ESTADO ACTUAL:** SOLTEROS ${emojis.soltero}\n` +
                   `💔 Última pareja: ${estado.pareja1} & ${estado.pareja2}\n` +
                   `📅 Último divorcio: ${estado.fechaDivorcio ? estado.fechaDivorcio.toLocaleDateString() : "Nunca"}\n` +
                   `💌 Usa "casarse" para comenzar una nueva unión`;
        }
    }

    // Función de ayuda
    function mostrarAyuda() {
        return `💍 *BOT DE CASAMIENTO VIRTUAL* 💍\n\n` +
               `📋 **COMANDOS DISPONIBLES:**\n` +
               `• "casarse [nombre1] [nombre2]" - Para casar a una pareja\n` +
               `• "divorcio" - Para divorciar a la pareja actual\n` +
               `• "estado" - Muestra el estado actual\n` +
               `• "ayuda" - Muestra esta ayuda\n\n` +
               `📸 **Foto del casamiento incluida:**\n${fotoCasamiento}\n\n` +
               `💡 **Ejemplos:**\n` +
               `- casarse Ana Carlos\n` +
               `- divorcio\n` +
               `- estado`;
    }

    // Función para crear un certificado de casamiento ASCII
    function crearCertificadoAscii() {
        return `
╔══════════════════════════════════════════╗
║        📜 CERTIFICADO DE MATRIMONIO      ║
╠══════════════════════════════════════════╣
║                                          ║
║  CERTIFICAMOS QUE                        ║
║                                          ║
║  💖 ${estado.pareja1.padEnd(20)} 💖        ║
║                 Y                        ║
║  💖 ${estado.pareja2.padEnd(20)} 💖        ║
║                                          ║
║  HAN CONTRAÍDO MATRIMONIO VIRTUAL        ║
║                                          ║
║  Fecha: ${estado.fechaCasamiento.toLocaleDateString().padEnd(20)} ║
║  Hora: ${estado.fechaCasamiento.toLocaleTimeString().padEnd(21)} ║
║                                          ║
║  "Hasta que el bot los separe"           ║
║                                          ║
╚══════════════════════════════════════════╝
        `;
    }

    // Devolver las funciones públicas
    return {
        manejarComando,
        crearCertificadoAscii,
        getEstado: () => estado,
        setPareja: (nombre1, nombre2) => {
            estado.pareja1 = nombre1 || estado.pareja1;
            estado.pareja2 = nombre2 || estado.pareja2;
        }
    };
}

// =========== EJEMPLOS DE USO EN UN BOT ===========

// Crear instancia del bot
const botCasamiento = weddingBot();

// Ejemplo 1: Mostrar ayuda
console.log("=== EJEMPLO 1: AYUDA ===");
console.log(botCasamiento.manejarComando("ayuda"));
console.log("\n".repeat(2));

// Ejemplo 2: Casarse
console.log("=== EJEMPLO 2: CASARSE ===");
console.log(botCasamiento.manejarComando("casarse", "María", "Juan"));
console.log("\n".repeat(2));

// Ejemplo 3: Ver estado
console.log("=== EJEMPLO 3: ESTADO ===");
console.log(botCasamiento.manejarComando("estado"));
console.log("\n".repeat(2));

// Ejemplo 4: Divorciarse
console.log("=== EJEMPLO 4: DIVORCIO ===");
// Esperar un momento para que pase tiempo
setTimeout(() => {
    console.log(botCasamiento.manejarComando("divorcio"));
    console.log("\n".repeat(2));
    
    // Ejemplo 5: Certificado (cuando están casados)
    console.log("=== EJEMPLO 5: VOLVER A CASARSE ===");
    console.log(botCasamiento.manejarComando("casarse", "Luis", "Ana"));
}, 100);

// =========== CÓMO INTEGRAR EN TU BOT ===========
/*
// Para Discord.js, Telegram Bot, etc.:

1. Importa/requiere este código
2. Crea una instancia: const bot = weddingBot();
3. En tu handler de mensajes:

if (mensaje.startsWith('!casarse')) {
    const partes = mensaje.split(' ');
    const nombre1 = partes[1];
    const nombre2 = partes[2];
    const respuesta = bot.manejarComando('casarse', nombre1, nombre2);
    enviarMensaje(respuesta);
}

if (mensaje === '!divorcio') {
    const respuesta = bot.manejarComando('divorcio');
    enviarMensaje(respuesta);
}

if (mensaje === '!estado') {
    const respuesta = bot.manejarComando('estado');
    enviarMensaje(respuesta);
}

if (mensaje === '!ayuda') {
    const respuesta = bot.manejarComando('ayuda');
    enviarMensaje(respuesta);
}
*/

// Versión simplificada para copiar y pegar directamente:
const casamientoSimple = {
    foto: "https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg",
    casados: false,
    
    casar: function(nombre1 = "Persona1", nombre2 = "Persona2") {
        this.casados = true;
        return `💍 ¡${nombre1} y ${nombre2} se han casado!\n📸 Foto: ${this.foto}\n🎉 ¡Felicidades!`;
    },
    
    divorciar: function() {
        this.casados = false;
        return "💔 ¡Se han divorciado!\n📄 Acta de divorcio firmada.\n😭 Hasta la próxima...";
    }
};

// Uso ultra simple:
console.log("\n=== VERSIÓN SIMPLIFICADA ===");
console.log(casamientoSimple.casar("Ana", "Carlos"));
console.log(casamientoSimple.divorciar());