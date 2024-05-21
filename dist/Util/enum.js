"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelId = exports.House = void 0;
class House {
    id;
    name;
    description;
    emoji;
    roleId;
    channelId;
    constructor(id, name, description, emoji, roleId, channelId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.emoji = emoji;
        this.roleId = roleId;
        this.channelId = channelId;
    }
    static ids = ['TIGER', 'OWL', 'RAVEN', 'TURTLE', 'PANDA'];
    static get ALL() {
        return [
            House.TIGER,
            House.OWL,
            House.RAVEN,
            House.TURTLE,
            House.PANDA
        ];
    }
    static TIGER = new House('TIGER', 'Tiger Terror Squad', 'brave, courageous, fearless, strong, fierce, competitive, and powerful.', '🐯', '1024014286416261191', '1023372920170483713');
    static OWL = new House('OWL', 'Court of Owls', 'observant, Integrity, judge, They do not speak a lot but when they do, they talk wisely.', '🦉', '1024014430448660490', '1023373108389883979');
    static RAVEN = new House('RAVEN', 'Raven Reapers', 'The eye of all eyes, Pure Daily Offenders, can be calm or on crud, depending on the tea or tequila!', '👁️', '1024014477789773965', '1023373249733738536');
    static TURTLE = new House('TURTLE', 'The Otakus', 'chill, perseverance, otaku, cosplay(LOT\'S OF NOSE BLEEDS), gamers and tech enthusiast! ', '🐢', '1024014510723432478', '1023373586465046528');
    static PANDA = new House('PANDA', 'Pandamonium', 'bashful, emotional, foodie, jokes, sleepy, knowledgeable.', '🐼', '1024014614536667239', '1023373723551666296');
}
exports.House = House;
exports.ChannelId = {
    Logs: '1025143957186941038',
    Trophy: '1028280826472955975',
};
