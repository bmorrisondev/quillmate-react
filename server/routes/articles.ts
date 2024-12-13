import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Get all articles
router.get('/', async (req, res) => {
  try {
    if(!req.user) {
      res.status(404).json({ error: 'User not found' });
      return
    }

    const allArticles = await prisma.article.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
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
    if(!req.user) {
      res.status(404).json({ error: 'User not found' });
      return
    }
    
    const article = await prisma.article.findUnique({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return
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
    if(!req.user) {
      res.status(404).json({ error: 'User not found' });
      return
    }
    
    const { title, content, summary } = req.body;
    
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article
router.put('/:id', async (req, res) => {
  try {
    if(!req.user) {
      res.status(404).json({ error: 'User not found' });
      return
    }
    
    const { title, content, summary } = req.body;
    const articleId = parseInt(req.params.id);

    // First verify the article belongs to the user
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        userId: req.user.id
      }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id: articleId
      },
      data: {
        title,
        content,
        summary,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  try {
    if(!req.user) {
      res.status(404).json({ error: 'User not found' });
      return
    }

    const articleId = parseInt(req.params.id);

    // First verify the article belongs to the user
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        userId: req.user.id
      }
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    const deletedArticle = await prisma.article.delete({
      where: {
        id: articleId
      }
    });

    res.json(deletedArticle);
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
