import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg: { role: string, content: string }) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
    });

    const reply = completion.choices[0].message;

    res.json({ 
      content: reply.content,
      role: 'ai',
      id: Date.now().toString()
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;
