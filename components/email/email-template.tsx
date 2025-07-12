import * as React from "react"

interface EmailTemplateProps {
    name: string
    email: string
    subject: string
    message: string
}

export function EmailTemplate({ name, email, subject, message }: EmailTemplateProps) {
    return (
        <div style={{ fontFamily: "sans-serif", color: "#333", padding: "20px" }}>
            <h2 style={{ color: "#7c3aed" }}>📬 New Contact Form Message</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <div style={{ marginTop: "20px" }}>
                <p><strong>Message:</strong></p>
                <p style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: "10px", borderRadius: "8px" }}>
                    {message}
                </p>
            </div>
        </div>
    )
}
