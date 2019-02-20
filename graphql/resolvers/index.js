const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const getEvents = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: getUser.bind(this, event.creator)
            };
        });
    }
    catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            creator: getUser.bind(this, event.creator)
        };
    }
    catch (err) {
        throw err;
    }
}

const getUser = async userID => {
    try {
        const user = await User.findById(userID);
        return {
            ...user._doc,
            _id: user.id,
            password:null,
            createdEvents: getEvents.bind(this, user._doc.createdEvents)
        };
    }
    catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {

                return {
                    ...event._doc,
                    _id: event.id,
                    creator: getUser.bind(this, event._doc.creator)
                };
            });

        } catch (err) {
            throw err;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: getUser.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        }
        catch (err) {
            throw err;
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5c6b9bc2bff971186cc14268'
        });
        let createdEvent;
        try {
            const result = await event
                .save()
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                creator: getUser.bind(this, result._doc.creator)
            };
            const user = await User.findById('5c6b9bc2bff971186cc14268');
            if (!user) {
                throw new Error('user not found');
            }
            user.createdEvents.push(event);
            await user.save();
            return createdEvent;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createUser: async args => {
        try {
            const user = await User.findOne({ email: args.userInput.email })
            if (user) {
                throw new Error('user already exists');
            }
            const hashedpassword = await bcrypt.hash(args.userInput.password, 12);
            const user1 = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const result = await user1.save();
            return { ...result._doc, password: null, _id: result.id };
        }
        catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        const fetchedEvents = await Event.findOne({ _id: args.eventId });
        const booking = new Booking({
            user: '5c6b9bc2bff971186cc14268',
            event: fetchedEvents
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: getUser.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        };
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {
                ...booking.event._doc,
            creator:getUser.bind(this,booking.event._doc.creator)};

          
            //    console.log(booking.event);
            // await Booking.deleteOne({ _id: args.bookingId });
            return event;
        }
        catch (err) {
            throw err;
        }
    }
};