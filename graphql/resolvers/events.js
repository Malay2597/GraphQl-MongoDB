const { dateToString } = require('../../helpers/date');
const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args,req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated Request');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: '5c6b9bc2bff971186cc14268'
        });
        let createdEvent;
        try {
            const result = await event.save()
            createdEvent = transformEvent(result);
            const user = await User.findById('5c6b9bc2bff971186cc14268');
            if (!user) {
                throw new Error('user not found');
            }
            user.createdEvents.push(event);
            await user.save();
            return createdEvent;
        }
        catch (err) {
            throw err;
        }
    }
};