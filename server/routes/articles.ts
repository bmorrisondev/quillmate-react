import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

// Get default user or create if doesn't exist
// async function getDefaultUser() {
//   const defaultUser = await prisma.user.findFirst();
//   if (defaultUser) return defaultUser;

//   return prisma.user.create({
//     data: {
//       email: 'default@example.com',
//       name: 'Default User'
//     }
//   });
// }

// Get all articles
router.get('/', async (req, res) => {
  try {
    const allArticles = await prisma.article.findMany({
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
    const article = await prisma.article.findUnique({
      where: {
        id: parseInt(req.params.id)
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
    const defaultUser = await getDefaultUser();
    
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: defaultUser.id
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
      res.status(404).json({ error: 'Article not found' });
      return
    }

    res.json(deletedArticle);
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
