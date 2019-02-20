const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const getEvents = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
     return  events.map(event => {
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

const getUser = async userID => {
    try {
        const user = await User.findById(userID);
        return {
            ...user._doc,
            _id: user.id,
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
                creator: user.bind(this, result._doc.creator)
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
    }
}