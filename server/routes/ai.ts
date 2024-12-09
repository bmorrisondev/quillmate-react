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
    const articleId = parseInt(req.params.articleId);
    const messages = await prisma.message.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message and get AI response
router.post('/chat/:articleId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { content } = req.body;

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        articleId
      }
    });

    // Get all messages for context
    const messages = await prisma.message.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' }
    });

    // Get article content for context
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    // Create OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping with an article. Here's the current article content:\n\n${article?.content}\n\nPlease help answer questions about this article.`
        },
        ...messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }))
      ],
    });

    const aiResponse = completion.choices[0].message;

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse.content || '',
        role: 'ai',
        articleId
      }
    });

    // Return both messages
    res.json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;
