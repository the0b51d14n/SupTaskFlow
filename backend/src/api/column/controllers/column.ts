import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::column.column', ({ strapi }) => ({
  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const boardDocumentId = ctx.request.body.data?.board;
    if (boardDocumentId) {
      const board = await strapi.documents('api::board.board').findOne({
        documentId: boardDocumentId,
        populate: { owner: true },
      });
      if (!board || (board.owner as any)?.id !== ctx.state.user.id) return ctx.forbidden();
    }
    return super.create(ctx);
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const column = await strapi.documents('api::column.column').findOne({
      documentId: ctx.params.id,
      populate: { board: { populate: { owner: true } } },
    });
    if (!column) return ctx.notFound();
    if ((column.board as any)?.owner?.id !== ctx.state.user.id) return ctx.forbidden();
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const column = await strapi.documents('api::column.column').findOne({
      documentId: ctx.params.id,
      populate: { board: { populate: { owner: true } }, cards: true },
    });
    if (!column) return ctx.notFound();
    if ((column.board as any)?.owner?.id !== ctx.state.user.id) return ctx.forbidden();
    for (const card of (column.cards as any[]) ?? []) {
      await strapi.documents('api::card.card').delete({ documentId: card.documentId });
    }
    return super.delete(ctx);
  },
}));
