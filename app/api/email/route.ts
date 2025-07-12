import { Resend } from "resend"
import { EmailTemplate } from "@/components/email/email-template"

const resend = new Resend(process.env.NEXT_RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { name, email, subject, message } = body

        const { error } = await resend.emails.send({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: "saran.development@gmail.com",
            subject: subject || "New Contact Form Submission",
              replyTo: email,
            react: EmailTemplate({ name, email, subject, message }),
        })

        if (error) return Response.json({ error }, { status: 500 })
        return Response.json({ success: true })
    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
