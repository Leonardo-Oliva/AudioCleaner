// app/upload/page.js
"use client";

import { useState } from "react";
import { storage } from "../../lib/firebase";
import { ref, uploadBytes } from "firebase/storage";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileRef = ref(storage, `uploads/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      setMessage("Upload realizado com sucesso!");
    } catch (error) {
      setMessage("Erro ao fazer upload: " + error.message);
    }
  };

  return (
    <div>
      <h1>Upload de Arquivos</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Fazer Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
}
