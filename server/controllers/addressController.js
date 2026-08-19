import { Address } from '../models/index.js';

export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId });
    res.status(200).json(addresses);
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      // Unset previous defaults
      const previousDefaults = await Address.find({ userId, isDefault: true });
      for (const addr of previousDefaults) {
        await Address.findByIdAndUpdate(addr._id, { isDefault: false });
      }
    }

    const address = await Address.create({
      userId,
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: !!isDefault
    });

    res.status(201).json({ message: 'Address created.', address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    const existing = await Address.findById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Address not found or unauthorized.' });
    }

    if (isDefault && !existing.isDefault) {
      // Unset previous defaults
      const previousDefaults = await Address.find({ userId, isDefault: true });
      for (const addr of previousDefaults) {
        await Address.findByIdAndUpdate(addr._id, { isDefault: false });
      }
    }

    const updated = await Address.findByIdAndUpdate(id, {
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: !!isDefault
    }, { new: true });

    res.status(200).json({ message: 'Address updated.', address: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await Address.findById(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Address not found or unauthorized.' });
    }

    await Address.findByIdAndDelete(id);
    res.status(200).json({ message: 'Address deleted.' });
  } catch (error) {
    next(error);
  }
};
