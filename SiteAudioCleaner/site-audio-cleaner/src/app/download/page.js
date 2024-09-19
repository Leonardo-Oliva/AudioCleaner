"use client";

import { useState, useEffect } from "react";
import { storage } from "../../lib/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default function DownloadPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const folderRef = ref(storage, 'uploads'); // Substitua pelo caminho da sua pasta no Firebase
      try {
        const res = await listAll(folderRef);
        const filePromises = res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        });
        const filesList = await Promise.all(filePromises);
        setFiles(filesList);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao listar arquivos:", err);
        setError("Erro ao listar arquivos.");
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Download de Arquivos</h1>
      {loading && <p>Carregando arquivos...</p>}
      {error && <p>{error}</p>}
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a href={file.url} download={file.name}>
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
