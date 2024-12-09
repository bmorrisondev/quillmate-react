import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

// Get all articles
router.get('/', async (req, res) => {
  try {
    const allArticles = await prisma.article.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(allArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Create article
router.post('/', async (req, res) => {
  try {
    const { title, content, summary } = req.body;
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        summary
      }
    });

    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article
router.put('/:id', async (req, res) => {
  try {
    const { title, content, summary } = req.body;
    const updatedArticle = await prisma.article.update({
      where: {
        id: parseInt(req.params.id)
      },
      data: {
        title,
        content,
        summary,
        updatedAt: new Date()
      }
    });

    if (!updatedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  try {
    const deletedArticle = await prisma.article.delete({
      where: {
        id: parseInt(req.params.id)
      }
    });

    if (!deletedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(deletedArticle);
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
