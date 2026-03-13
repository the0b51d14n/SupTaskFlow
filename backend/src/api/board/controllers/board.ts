import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::board.board', ({ strapi }) => ({
  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    ctx.query = {
      ...ctx.query,
      filters: { ...((ctx.query.filters as object) ?? {}), owner: { id: ctx.state.user.id } },
    };
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!board) return ctx.notFound();
    if ((board.owner as any)?.id !== ctx.state.user.id) return ctx.forbidden();
    return super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    ctx.request.body.data = { ...ctx.request.body.data, owner: ctx.state.user.id };
    return super.create(ctx);
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!board) return ctx.notFound();
    if ((board.owner as any)?.id !== ctx.state.user.id) return ctx.forbidden();
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true, columns: { populate: { cards: true } } },
    });
    if (!board) return ctx.notFound();
    if ((board.owner as any)?.id !== ctx.state.user.id) return ctx.forbidden();
    for (const column of (board.columns as any[]) ?? []) {
      for (const card of (column.cards as any[]) ?? []) {
        await strapi.documents('api::card.card').delete({ documentId: card.documentId });
      }
      await strapi.documents('api::column.column').delete({ documentId: column.documentId });
    }
    return super.delete(ctx);
  },
}));
