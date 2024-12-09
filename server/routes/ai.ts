import { Router } from 'express';
import OpenAI from 'openai';
import { prisma } from '../db/prisma';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get messages for an article
router.get('/messages/:articleId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId)
    const messages = await prisma.message.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        role: true,
        context: true,
        createdAt: true,
      }
    })
    res.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
});

// Send a message and get AI response
router.post('/chat', async (req, res) => {
  try {
    const { message, articleId, context } = req.body

    // Save user message to database
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        context: context || null,
        articleId,
      },
    })

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant that helps users write and edit articles.' },
    ]

    // Add context if available
    if (context) {
      messages.push({ 
        role: 'system', 
        content: `The user is asking about the following text from their article: "${context}". Please reference this context in your response when relevant.`
      })
    }

    messages.push({ role: 'user', content: message })

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    })

    const aiResponse = completion.choices[0].message.content

    // Save AI response to database
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'ai',
        articleId,
      },
    })

    res.json({ userMessage, aiMessage })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    res.status(500).json({ error: 'Failed to process chat request' })
  }
})

export default router;
