"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.welcome}>Bem-vindo, {user.email}</p>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Sair
      </button>
      <button className={styles.button} onClick={() => router.push("/download")}>
        Audios Tratados
      </button>
      <button className={styles.button} onClick={() => router.push("/upload")}>
        Ir para Upload
      </button>
    </div>
  );
}
