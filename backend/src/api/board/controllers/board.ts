import { factories } from '@strapi/strapi';

function extractBoardUserId(board: any): number | null {
  const ownerId =
    board?.owner?.id ??
    board?.owner?.data?.id ??
    board?.attributes?.owner?.id ??
    board?.attributes?.owner?.data?.id;

  const createdById =
    board?.createdBy?.id ??
    board?.createdBy?.data?.id ??
    board?.attributes?.createdBy?.id ??
    board?.attributes?.createdBy?.data?.id;

  const resolved = ownerId ?? createdById;
  return resolved == null ? null : Number(resolved);
}

export default factories.createCoreController('api::board.board', ({ strapi }) => ({
  async find(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const boards = await strapi.documents('api::board.board').findMany({
      populate: {
        owner: true,
        createdBy: true,
        columns: {
          populate: {
            cards: true,
          },
        },
      },
    });

    const filteredBoards = (boards ?? []).filter(
      (board: any) => extractBoardUserId(board) === Number(ctx.state.user.id)
    );

    const sanitized = await this.sanitizeOutput(filteredBoards as any, ctx);
    return this.transformResponse(sanitized);
  },

  async findOne(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true, createdBy: true },
    });
    if (!board) return ctx.notFound();
    if (extractBoardUserId(board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    return super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const result = (await super.create(ctx)) as any;

    const documentId = result?.data?.documentId;
    if (documentId) {
      try {
        await strapi.documents('api::board.board').update({
          documentId,
          data: { owner: ctx.state.user.id },
        });
      } catch (error) {
        strapi.log.warn('Unable to set board owner after creation, fallback to createdBy ownership.');
      }
    }

    return result;
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true, createdBy: true },
    });
    if (!board) return ctx.notFound();
    if (extractBoardUserId(board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const board = await strapi.documents('api::board.board').findOne({
      documentId: ctx.params.id,
      populate: { owner: true, createdBy: true, columns: { populate: { cards: true } } },
    });
    if (!board) return ctx.notFound();
    if (extractBoardUserId(board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    for (const column of (board.columns as any[]) ?? []) {
      for (const card of (column.cards as any[]) ?? []) {
        await strapi.documents('api::card.card').delete({ documentId: card.documentId });
      }
      await strapi.documents('api::column.column').delete({ documentId: column.documentId });
    }
    return super.delete(ctx);
  },
}));
