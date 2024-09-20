// app/upload/page.js
"use client";

import { useState } from "react";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Importar autenticação
import "./upload.css"; // Importa o CSS

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMessage("Usuário não autenticado.");
      return;
    }

    const fileRef = ref(storage, `uploads/${user.uid}/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      setMessage("Upload realizado com sucesso!");
    } catch (error) {
      setMessage("Erro ao fazer upload: " + error.message);
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
