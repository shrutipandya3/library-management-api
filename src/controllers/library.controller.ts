import { NextFunction, Request, Response } from "express";
import { createLibrary, deleteLibraryById, getAllLibraries, getAllLibrariesDropdown, getLibraryById, updateLibrary } from "@/services/library.service";
import { sendResponse } from "@/utils/sendResponse";
import { validationResult } from "express-validator";
import { CreateLibraryInput, DeleteLibraryInput, GetLibraryByIdInput, UpdateLibraryBodyInput, UpdateLibraryParamsInput } from "@/validators/library.validator";
import i18n from "@/config/i18n";

export const createLibraryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, adminId }: CreateLibraryInput = req.body;

    const library = await createLibrary({ name, adminId }, req.getLocale());

    sendResponse({
      res,
      statusCode: 201,
      message: i18n.__("library_created"),
      data: library,
    });

    return;
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};

export const getAllLibrariesDropdownHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const libraries = await getAllLibrariesDropdown();
    sendResponse({
      res,
      message: i18n.__("libraries_fetched"),
      data: libraries,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllLibrariesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const libraries = await getAllLibraries();
    sendResponse({
      res,
      message: i18n.__("libraries_fetched"),
      data: libraries,
    });
  } catch (error) {
    next(error);
  }
};

export const getLibraryByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id }: GetLibraryByIdInput = {
      id: Number(req.params.id),
    };
    const library = await getLibraryById(id, req.getLocale());

    sendResponse({
      res,
      message: i18n.__("library_fetched"),
      data: library,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLibraryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id }: UpdateLibraryParamsInput = {
      id: Number(req.params.id),
    };
    const { name, adminId }: UpdateLibraryBodyInput = req.body;

    const library = await updateLibrary(id, { name, adminId }, req.getLocale());

    sendResponse({
      res,
      statusCode: 200,
      message: i18n.__("library_updated"),
      data: library,
    });

    return;
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};

export const deleteLibraryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id }: DeleteLibraryInput = {
      id: Number(req.params.id),
    };
    await deleteLibraryById(id, req.getLocale());

    sendResponse({
      res,
      message: i18n.__("library_deleted"),
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
