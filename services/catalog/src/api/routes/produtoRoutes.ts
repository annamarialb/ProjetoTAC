import { Router } from 'express';
import { ProdutoController } from '../ProdutoController';

const router = Router();
const controller = new ProdutoController();

/**
 * @swagger
 * /api/v1/produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */
router.get('/', (req, res) => controller.listarTodos(req, res));

/**
 * @swagger
 * /api/v1/produtos/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', (req, res) => controller.buscarPorId(req, res));
export default router;