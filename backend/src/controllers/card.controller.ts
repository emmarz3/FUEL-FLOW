import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import cardModel, { CardStatus } from "../models/Card";
import nombaService from "../services/nomba.service";
import { AppError } from "../middleware/error.middleware";

export const saveCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { number, expiryMonth, expiryYear, cvv, name, billingAddress } = req.body;
    const userId = req.user._id;

    if (!number || !expiryMonth || !expiryYear || !cvv || !name) {
      throw new AppError("All card fields are required", StatusCodes.BAD_REQUEST);
    }

    const nombaCard = await nombaService.createTokenizedCard({
      customer: userId.toString(),
      card: { number, expiryMonth, expiryYear, cvv, name, billingAddress },
    });

    const card = await cardModel.create({
      user: userId,
      nombaCardId: nombaCard.id,
      brand: nombaCard.brand || "unknown",
      last4: number.slice(-4),
      expiryMonth,
      expiryYear,
      status: CardStatus.ACTIVE,
      billingAddress,
    });

    const existingCards = await cardModel.find({ user: userId });
    if (existingCards.length === 1) {
      card.isDefault = true;
      await card.save();
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        card: {
          id: card._id,
          brand: card.brand,
          last4: card.last4,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          isDefault: card.isDefault,
          displayName: `${card.brand} •••• ${card.last4}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await cardModel.find({ user: req.user._id });
    res.status(StatusCodes.OK).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await cardModel.findById(req.params.id);
    if (!card) throw new AppError("Card not found", StatusCodes.NOT_FOUND);
    if (card.user.toString() !== req.user._id.toString()) {
      throw new AppError("Not authorized to delete this card", StatusCodes.FORBIDDEN);
    }
    await nombaService.deleteCard(card.nombaCardId);
    await card.deleteOne();
    res.status(StatusCodes.OK).json({ success: true, message: "Card deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const setDefaultCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await cardModel.findById(req.params.id);
    if (!card) throw new AppError("Card not found", StatusCodes.NOT_FOUND);
    if (card.user.toString() !== req.user._id.toString()) {
      throw new AppError("Not authorized", StatusCodes.FORBIDDEN);
    }
    await cardModel.updateMany({ user: req.user._id, isDefault: true }, { $set: { isDefault: false } });
    card.isDefault = true;
    await card.save();
    res.status(StatusCodes.OK).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};
