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
      const formData = new FormData();
      formData.append("file", file);

      const userId = user.uid;
      const apiUrl = `http://localhost:8000/process_audio/?user_id=${userId}`;

      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setMessage("Sucesso: " + response.data.message);
      } else {
        setMessage("Erro ao processar arquivo: " + response.data.message);
      }
    } catch (error) {
      console.error("Error details:", error);
      setMessage("Erro ao processar e fazer upload: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <h1 className="title">Upload de Arquivos</h1>
      <input type="file" onChange={handleFileChange} className="input-file" />
      <button onClick={handleUpload} className="button">Fazer Upload</button>
      <button onClick={() => window.location.href = "/download"} className="button">Audios Processados</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
