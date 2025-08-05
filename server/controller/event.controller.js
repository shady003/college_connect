import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import createError from "../utils/createError.js";

// Create a new event
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      maxAttendees,
      isPrivate,
      tags,
      requirements,
      groupId
    } = req.body;

    if (!title || !description || !category || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Title, description, category, start date, and end date are required" 
      });
    }

    const newEvent = new Event({
      title,
      description,
      category,
      organizer: req.user.id,
      group: groupId || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: location || { type: "Physical" },
      maxAttendees: maxAttendees || null,
      isPrivate: isPrivate || false,
      tags: tags || [],
      requirements: requirements || [],
      attendees: [{
        user: req.user.id,
        status: 'going',
        registeredAt: new Date()
      }]
    });

    await newEvent.save();
    await newEvent.populate('organizer', 'username email college_name');

    console.log(`Event created: ${title} by ${req.user.username}`);

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });

  } catch (err) {
    console.error("Create event error:", err);
    next(createError(500, "Failed to create event"));
  }
};

// Get all events (with filters)
export const getEvents = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10, upcoming = true } = req.query;
    
    let query = { isPrivate: false };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    // Show all public events

    const events = await Event.find(query)
      .populate('organizer', 'username college_name role')
      .populate('group', 'name')
      .populate('attendees.user', 'username college_name')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (err) {
    console.error("Get events error:", err);
    next(createError(500, "Failed to fetch events"));
  }
};

// Get event by ID
export const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('organizer', 'username email college_name')
      .populate('group', 'name')
      .populate('attendees.user', 'username email college_name profile_pic');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user can access private event
    if (event.isPrivate) {
      const isAttendee = event.attendees.some(attendee => 
        attendee.user._id.toString() === req.user.id
      );
      
      if (!isAttendee) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.status(200).json({ event });

  } catch (err) {
    console.error("Get event error:", err);
    next(createError(500, "Failed to fetch event"));
  }
};

// Attend an event
import Notification from "../models/notification.model.js";

export const attendEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'going' } = req.body;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is already registered
    const existingAttendee = event.attendees.find(attendee => 
      attendee.user.toString() === req.user.id
    );

    if (existingAttendee) {
      // Update status
      existingAttendee.status = status;
      await event.save();
    } else {
      // Check if event is full
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ message: "Event is full" });
      }

      // Add new attendee
      event.attendees.push({
        user: req.user.id,
        status,
        registeredAt: new Date()
      });
      await event.save();

      // Create notification for event organizer (admin)
      const notification = new Notification({
        recipient: event.organizer,
        sender: req.user.id,
        type: 'event_invite',
        title: 'New Event Join Request',
        message: `${req.user.username} wants to join your event "${event.title}".`,
        data: {
          eventId: event._id,
          url: `/event/${event._id}`
        },
        priority: 'High'
      });
      await notification.save();
    }

    console.log(`User ${req.user.username} ${status} event ${event.title}`);

    res.status(200).json({ 
      message: `Successfully ${status} the event`,
      event 
    });

  } catch (err) {
    console.error("Attend event error:", err);
    next(createError(500, "Failed to attend event"));
  }
};

// Update event (organizer only)
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the organizer can update the event" });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'category', 'startDate', 'endDate', 
      'location', 'maxAttendees', 'isPrivate', 'tags', 'requirements'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        event[field] = updates[field];
      }
    });

    await event.save();

    console.log(`Event ${event.title} updated by ${req.user.username}`);

    res.status(200).json({ 
      message: "Event updated successfully",
      event 
    });

  } catch (err) {
    console.error("Update event error:", err);
    next(createError(500, "Failed to update event"));
  }
};

// Delete event (organizer only)
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the organizer can delete the event" });
    }

    await Event.findByIdAndDelete(id);

    console.log(`Event ${event.title} deleted by ${req.user.username}`);

    res.status(200).json({ 
      message: "Event deleted successfully" 
    });

  } catch (err) {
    console.error("Delete event error:", err);
    next(createError(500, "Failed to delete event"));
  }
};

// Get user's events
export const getUserEvents = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type = 'all' } = req.query; // all, organized, attending

    let query = {};
    
    switch (type) {
      case 'organized':
        query.organizer = userId;
        break;
      case 'attending':
        query['attendees.user'] = userId;
        break;
      default:
        query.$or = [
          { organizer: userId },
          { 'attendees.user': userId }
        ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'username college_name')
      .populate('group', 'name')
      .populate('attendees.user', 'username college_name')
      .sort({ startDate: 1 });

    res.status(200).json({ events });

  } catch (err) {
    console.error("Get user events error:", err);
    next(createError(500, "Failed to fetch user events"));
  }
}; 