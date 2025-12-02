// Helper utilities to convert Sequelize instances to plain DTOs
export function toDTO(instance) {
  if (!instance) return null;

  let data = instance.get ? instance.get({ plain: true }) : instance;

  // FIX: convert boolean status -> number
  if (typeof data.status === "boolean") {
    data.status = data.status ? 1 : 0;
  }

  return data;
}


export function toDTOs(list) {
  if (!list) return [];
  if (!Array.isArray(list)) return [toDTO(list)];
  return list.map(i => toDTO(i));
}

export default { toDTO, toDTOs };
