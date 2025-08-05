import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user?.id;
    
    if (userId !== currentUserId) {
      return next(createError(403, "You can only update your own profile"));
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return next(createError(404, "User not found"));
    }
    
    res.status(200).json(updatedUser);
  } catch (err) {
    next(createError(500, "Failed to update user"));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return next(createError(404, "User not found"));
    }
    
    res.status(200).json(user);
  } catch (err) {
    next(createError(500, "Failed to get user"));
  }
};