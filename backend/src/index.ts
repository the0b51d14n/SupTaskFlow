import type { Core } from '@strapi/strapi';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const authenticated = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticated) return;

    const actions = [
      'api::board.board.find',
      'api::board.board.findOne',
      'api::board.board.create',
      'api::board.board.update',
      'api::board.board.delete',
      'api::column.column.find',
      'api::column.column.findOne',
      'api::column.column.create',
      'api::column.column.update',
      'api::column.column.delete',
      'api::card.card.find',
      'api::card.card.findOne',
      'api::card.card.create',
      'api::card.card.update',
      'api::card.card.delete',
    ];

    for (const action of actions) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: authenticated.id } });

      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action, role: authenticated.id, enabled: true },
        });
      } else if (!existing.enabled) {
        await strapi.db.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
    }
  },
};
