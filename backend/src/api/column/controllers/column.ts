import { factories } from '@strapi/strapi';

function extractBoardUserId(board: any): number | null {
  const ownerId = board?.owner?.id ?? board?.owner?.data?.id;
  const createdById = board?.createdBy?.id ?? board?.createdBy?.data?.id;
  const resolved = ownerId ?? createdById;
  return resolved == null ? null : Number(resolved);
}

export default factories.createCoreController('api::column.column', ({ strapi }) => ({
  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const boardDocumentId = ctx.request.body.data?.board;
    if (boardDocumentId) {
      const board = await strapi.documents('api::board.board').findOne({
        documentId: boardDocumentId,
        populate: { owner: true, createdBy: true },
      });
      if (!board || extractBoardUserId(board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    }
    return super.create(ctx);
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const column = await strapi.documents('api::column.column').findOne({
      documentId: ctx.params.id,
      populate: { board: { populate: { owner: true, createdBy: true } } },
    });
    if (!column) return ctx.notFound();
    if (extractBoardUserId(column.board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const column = await strapi.documents('api::column.column').findOne({
      documentId: ctx.params.id,
      populate: { board: { populate: { owner: true, createdBy: true } }, cards: true },
    });
    if (!column) return ctx.notFound();
    if (extractBoardUserId(column.board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    for (const card of (column.cards as any[]) ?? []) {
      await strapi.documents('api::card.card').delete({ documentId: card.documentId });
    }
    return super.delete(ctx);
  },
}));
