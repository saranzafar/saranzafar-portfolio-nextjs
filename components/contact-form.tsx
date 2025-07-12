"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await axios.post("/api/email", formData)

      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
      })

      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
      <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-25 hover:opacity-100 transition duration-1000 hover:duration-200"></div>
        <div className="relative">
          <h3 className="text-2xl font-bold mb-6">Send Me a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} className="bg-zinc-900/50 border-zinc-700" />
            <Input type="email" name="email" placeholder="Your Email" required value={formData.email} onChange={handleChange} className="bg-zinc-900/50 border-zinc-700" />
            <Input name="subject" placeholder="Subject" required value={formData.subject} onChange={handleChange} className="bg-zinc-900/50 border-zinc-700" />
            <Textarea name="message" placeholder="Your Message" rows={5} required value={formData.message} onChange={handleChange} className="bg-zinc-900/50 border-zinc-700" />
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 border-0" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
