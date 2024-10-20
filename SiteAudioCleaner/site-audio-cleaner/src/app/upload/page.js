// app/upload/page.js
"use client";

import { useState } from "react";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import axios from "axios";
import "./upload.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor, selecione um arquivo para upload.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMessage("Usuário não autenticado.");
      return;
    }

    try {
      // Enviar o arquivo de áudio para a API
      const formData = new FormData();
      formData.append("file", file);

      const userId = user.uid; // Obter o user_id
      const apiUrl = `http://localhost:8000/process_audio/?user_id=${userId}`; // Adicionar o user_id na URL

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Verifica se a resposta é 200 OK
      if (response.status === 200) {
        setMessage("Arquivo processado com sucesso: " + response.data.message); // Exibe a mensagem retornada pela API
      } else {
        // Se o status não for 200, exibe a mensagem de erro
        setMessage("Erro ao processar arquivo: " + response.data.message);
      }
    } catch (error) {
      // Log do erro para diagnóstico
    console.error("Error details:", error); // Log do erro para ver detalhes
    setMessage("Erro ao processar e fazer upload: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <h1 className="title">Upload de Arquivos</h1>
      <input type="file" onChange={handleFileChange} className="input-file" />
      <button onClick={handleUpload} className="button">Fazer Upload</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
