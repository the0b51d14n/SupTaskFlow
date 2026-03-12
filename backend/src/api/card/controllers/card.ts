import { factories } from '@strapi/strapi';

function extractBoardUserId(board: any): number | null {
  const ownerId = board?.owner?.id ?? board?.owner?.data?.id;
  const createdById = board?.createdBy?.id ?? board?.createdBy?.data?.id;
  const resolved = ownerId ?? createdById;
  return resolved == null ? null : Number(resolved);
}

async function resolveCardOwner(strapi: any, cardDocumentId: string): Promise<number | null> {
  const card = await strapi.documents('api::card.card').findOne({
    documentId: cardDocumentId,
    populate: { column: { populate: { board: { populate: { owner: true, createdBy: true } } } } },
  });
  return extractBoardUserId((card?.column as any)?.board);
}

export default factories.createCoreController('api::card.card', ({ strapi }) => ({
  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const columnDocumentId = ctx.request.body.data?.column;
    if (columnDocumentId) {
      const column = await strapi.documents('api::column.column').findOne({
        documentId: columnDocumentId,
        populate: { board: { populate: { owner: true, createdBy: true } } },
      });
      if (!column || extractBoardUserId(column.board) !== Number(ctx.state.user.id)) return ctx.forbidden();
    }
    return super.create(ctx);
  },

  async update(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const ownerId = await resolveCardOwner(strapi, ctx.params.id);
    if (ownerId === null) return ctx.notFound();
    if (ownerId !== ctx.state.user.id) return ctx.forbidden();
    return super.update(ctx);
  },

  async delete(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();
    const ownerId = await resolveCardOwner(strapi, ctx.params.id);
    if (ownerId === null) return ctx.notFound();
    if (ownerId !== ctx.state.user.id) return ctx.forbidden();
    return super.delete(ctx);
  },
}));
