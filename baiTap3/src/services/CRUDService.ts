import User from "../models/user";

export const createUser = async (data: { firstName: string; lastName: string; email: string }) => {
  return await User.create(data);
};

export const getAllUsers = async () => {
  return await User.findAll();
};

export const getUserById = async (id: number) => {
  return await User.findByPk(id);
};

export const updateUser = async (id: number, data: Partial<{ firstName: string; lastName: string; email: string }>) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(data);
};

export const deleteUser = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return user;
};
