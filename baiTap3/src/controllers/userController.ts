import { Request, Response } from "express";
import * as CRUDService from "../services/CRUDService";

export const renderList = async (req: Request, res: Response) => {
  const users = await CRUDService.getAllUsers();
  res.render("index", { users });
};

export const renderEdit = async (req: Request, res: Response) => {
  const user = await CRUDService.getUserById(Number(req.params.id));
  if (!user) return res.status(404).send("User not found");
  res.render("edit", { user });
};

// API CRUD
export const create = async (req: Request, res: Response) => {
  await CRUDService.createUser(req.body);
  res.redirect("/");
};

export const findAll = async (req: Request, res: Response) => {
  const users = await CRUDService.getAllUsers();
  res.json(users);
};

export const findOne = async (req: Request, res: Response) => {
  const user = await CRUDService.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
};

export const update = async (req: Request, res: Response) => {
  await CRUDService.updateUser(Number(req.params.id), req.body);
  res.redirect("/");
};

export const remove = async (req: Request, res: Response) => {
  await CRUDService.deleteUser(Number(req.params.id));
  res.redirect("/");
};
