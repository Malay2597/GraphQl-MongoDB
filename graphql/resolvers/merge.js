const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

const getEvents = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return transformEvent(event);
        });
    }
    catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    }
    catch (err) {
        throw err;
    }
};

const getUser = async userID => {
    try {
        const user = await User.findById(userID);
        return {
            ...user._doc,
            _id: user.id,
            password: null,
            createdEvents: getEvents.bind(this, user._doc.createdEvents)
        };
    }
    catch (err) {
        throw err;
    }
};

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: getUser.bind(this, event.creator)
    };
};

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: getUser.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;

