import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/send-completion-email", async (req, res) => {
    try {
      const { email, name, orderId, courseName } = req.body;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"GenAI Assist Pro" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Generative AI Assistance is Completed 🎉",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Hello ${name},</h2>
            <p>Great news! Your assistance request for <strong>${courseName}</strong> (Order ID: ${orderId}) has been completed.</p>
            <p>Our mentors have finalized the walkthroughs and explanations for you.</p>
            <div style="margin-top: 30px;">
              <a href="${process.env.APP_URL}/feedback/${orderId}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Submit Feedback</a>
            </div>
            <p style="margin-top: 40px; font-size: 0.8em; color: #666;">GenAI Assist Pro - Mentorship for the Future.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
