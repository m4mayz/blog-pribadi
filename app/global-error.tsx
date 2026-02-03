"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Boundary caught:", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "500px",
                            textAlign: "center",
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "4rem",
                                margin: 0,
                                fontWeight: "bold",
                            }}
                        >
                            500
                        </h1>
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                marginTop: "1rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Application Error
                        </h2>
                        <p
                            style={{
                                color: "#666",
                                marginBottom: "2rem",
                            }}
                        >
                            A critical error occurred. Please try refreshing the
                            page.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.75rem 2rem",
                                fontSize: "1rem",
                                backgroundColor: "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
