import os
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from pedalboard.io import AudioFile
from pedalboard import *
import noisereduce as nr

# Definir a taxa de amostragem (sample rate)
sr = 44100

app = FastAPI()


@app.post("/process_audio/")
async def process_audio(file: UploadFile = File(...)):
    # Salvar o arquivo de áudio enviado
    input_file_path = f'audios/{file.filename}'
    output_file_path = input_file_path.replace('.wav', '_enhanced.wav')

    with open(input_file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Abrir o arquivo de áudio e resamplear para a taxa de amostragem desejada
    with AudioFile(input_file_path).resampled_to(sr) as f:
        audio = f.read(f.frames)

    # Verificar o número de canais do áudio original
    if audio.ndim == 1:  # Se o áudio for mono (1 canal)
        audio = np.expand_dims(audio, axis=0)  # Adicionar um eixo para torná-lo 2D (1, N)
    elif audio.ndim == 2 and audio.shape[0] > 2:  # Caso o áudio tenha mais de 2 canais
        raise ValueError("O áudio tem mais de 2 canais, o que não é suportado.")

    # Reduzir o ruído usando a biblioteca noisereduce
    reduced_noise = nr.reduce_noise(y=audio, sr=sr, stationary=True, prop_decrease=0.75)

    # Configurar a pedalboard com vários efeitos
    board = Pedalboard([
        NoiseGate(threshold_db=-30, ratio=1.5, release_ms=250),
        Compressor(threshold_db=-16, ratio=2.5),
        LowShelfFilter(cutoff_frequency_hz=400, gain_db=10, q=1),
        Gain(gain_db=10)
    ])

    # Aplicar os efeitos ao áudio com ruído reduzido
    effected = board(reduced_noise, sr)

    # Verificar o número de canais do áudio processado
    if effected.ndim == 1:  # Se o áudio for mono (1 canal)
        effected = np.expand_dims(effected, axis=0)  # Torná-lo estéreo (2D)

    # Salvar o áudio processado em um novo arquivo
    with AudioFile(output_file_path, 'w', sr, effected.shape[0]) as f:
        f.write(effected)

    # Retornar o arquivo de áudio processado
    return FileResponse(output_file_path, media_type='audio/wav')


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)